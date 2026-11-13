#!/usr/bin/env node
// vibe-launchpad guard (PreToolUse). Active only inside vibe-launchpad projects
// (a folder with .launchpad/profile.json). It denies:
//   1. writing secret keys into code files (Write / Edit / MultiEdit)
//   2. git add / commit / push that would put secret files or keys into Git
//   3. firebase deploy (incl. preview channels) when the build contains secret keys
//      or Firestore rules let anyone write
// It fails open: any internal error lets the tool call proceed.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import {
  AGENT_TOOLS,
  gitInfo,
  findProject,
  touchSession,
  activeOthers,
  folderConflict,
  agentsAllowed,
  isInside,
} from './lib.mjs'

const SECRET_PATTERNS = [
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key', /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}/],
  ['Stripe secret key', /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
]

const HOW_TO_EXPLAIN =
  'Explain this to the owner in plain Korean (API keys are like credit cards). Put the secret only in a gitignored file (.env, server/.dev.vars) or a server secret (wrangler secret put), never in code. See the api-keys and safety-check skills.'

function isSecretFile(p) {
  const base = path.basename(String(p).replace(/^["']|["']$/g, ''))
  if (/^\.env\.(example|sample|template)$/i.test(base)) return false
  return (
    /^\.env(\..+)?$/.test(base) ||
    base === '.dev.vars' ||
    /\.pem$/i.test(base) ||
    /(service-?account|firebase-adminsdk).*\.json$/i.test(base)
  )
}

function findSecret(text) {
  if (!text) return null
  for (const [name, re] of SECRET_PATTERNS) if (re.test(text)) return name
  return null
}

function findRoot(start) {
  if (!start) return null
  let dir = path.resolve(start)
  for (;;) {
    if (existsSync(path.join(dir, '.launchpad', 'profile.json'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

// core.quotePath=false keeps non-ASCII (e.g. Korean) paths readable instead of octal-escaped.
function git(cwd, args) {
  return execFileSync('git', ['-c', 'core.quotePath=false', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  })
}

function tryGit(cwd, args) {
  try {
    return git(cwd, args)
  } catch {
    return ''
  }
}

function lines(s) {
  return s.split('\n').map((l) => l.trim()).filter(Boolean)
}

function addedLines(diff) {
  return diff
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .join('\n')
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `[vibe-launchpad guard] ${reason} ${HOW_TO_EXPLAIN}`,
      },
    }) + '\n',
  )
  process.exit(0)
}

// Deny with a reason as-is (no secret-key explanation appended).
function deny0(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
    }) + '\n',
  )
  process.exit(0)
}

function checkWrite(ti) {
  const file = ti.file_path || ''
  if (isSecretFile(file)) return
  const texts = [ti.content, ti.new_string]
  if (Array.isArray(ti.edits)) for (const e of ti.edits) texts.push(e && e.new_string)
  const found = findSecret(texts.filter(Boolean).join('\n'))
  if (found) deny(`Blocked writing what looks like a ${found} into ${path.basename(file)}.`)
}

// Split a shell command into simple segments (on && || ; | and newlines).
function segments(cmd) {
  return cmd.split(/&&|\|\||[;|\n]/).map((s) => s.trim()).filter(Boolean)
}

function gitSub(segment) {
  const m = segment.match(/^(?:\S+=\S+\s+)*git\s+(?:-C\s+\S+\s+|-c\s+\S+\s+)*(add|commit|push)\b(.*)$/)
  return m ? { sub: m[1], rest: m[2] } : null
}

function checkTrackedSecretFiles(root) {
  const tracked = [
    ...lines(tryGit(root, ['ls-files'])),
    ...lines(tryGit(root, ['diff', '--cached', '--name-only', '--diff-filter=d'])),
  ]
  const bad = [...new Set(tracked.filter(isSecretFile))]
  if (bad.length)
    deny(
      `Secret file(s) are tracked by Git: ${bad.join(', ')}. Untrack them (git rm --cached <file>), make sure .gitignore covers them, and treat any real key inside as leaked (revoke and reissue).`,
    )
}

function checkUntracked(root, addsEverything) {
  const untracked = lines(tryGit(root, ['ls-files', '--others', '--exclude-standard']))
  const secretFiles = untracked.filter(isSecretFile)
  if (addsEverything && secretFiles.length)
    deny(`These secret files are not in .gitignore and would be added: ${secretFiles.join(', ')}. Add them to .gitignore first.`)
  for (const f of untracked) {
    try {
      const p = path.join(root, f)
      if (statSync(p).size > 5 * 1024 * 1024) continue
      const found = findSecret(readFileSync(p, 'utf8'))
      if (found) deny(`New file ${f} contains what looks like a ${found}.`)
    } catch {}
  }
}

function checkGit(root, cmd) {
  if (!tryGit(root, ['rev-parse', '--is-inside-work-tree'])) return // not a git repo yet

  const subs = segments(cmd).map(gitSub).filter(Boolean)
  if (!subs.length) return
  const has = (s) => subs.some((x) => x.sub === s)

  // Hooks run before the whole command, so `git add -A && git commit` must be judged
  // against the working tree, not only the current index.
  for (const { sub, rest } of subs) {
    if (sub !== 'add') continue
    const explicit = rest.split(/\s+/).filter((t) => t && !t.startsWith('-') && isSecretFile(t))
    if (explicit.length) deny(`Blocked adding secret file(s) to Git: ${explicit.join(', ')}.`)
  }

  if (has('add') || has('commit')) {
    checkTrackedSecretFiles(root)
    const addsEverything = subs.some(
      (x) => x.sub === 'add' && /(^|\s)(-A|--all|\.)(\s|$)/.test(x.rest),
    )
    const commitAll = subs.some(
      (x) => x.sub === 'commit' && /(^|\s)(-[a-zA-Z]*a[a-zA-Z]*|--all)(\s|$)/.test(x.rest),
    )
    // New (untracked) files are not in any diff; scan their contents when adding.
    if (has('add')) checkUntracked(root, addsEverything)

    const diff =
      has('add') || commitAll
        ? tryGit(root, ['diff', 'HEAD', '-U0']) || tryGit(root, ['diff', '-U0']) + tryGit(root, ['diff', '--cached', '-U0'])
        : tryGit(root, ['diff', '--cached', '-U0'])
    const found = findSecret(addedLines(diff))
    if (found) deny(`The changes being saved to Git contain what looks like a ${found}.`)
  }

  if (has('push')) {
    checkTrackedSecretFiles(root)
    // Everything not yet on the remote: all history if there is no upstream.
    const log =
      tryGit(root, ['log', '-p', '-U0', '--format=', '@{upstream}..HEAD']) ||
      tryGit(root, ['log', '-p', '-U0', '--format=', 'HEAD'])
    const found = findSecret(addedLines(log))
    if (found)
      deny(
        `A commit being pushed contains what looks like a ${found}. Deleting it in a later commit is not enough because history keeps it: revoke the key, then ask the owner before rewriting history.`,
      )
  }
}

function walk(dir, out, depth = 0) {
  if (depth > 8) return
  let names = []
  try {
    names = readdirSync(dir)
  } catch {
    return
  }
  for (const name of names) {
    const p = path.join(dir, name)
    let st
    try {
      st = statSync(p)
    } catch {
      continue // broken symlink etc.
    }
    if (st.isDirectory()) walk(p, out, depth + 1)
    else if (/\.(js|mjs|cjs|html|json|txt|map)$/i.test(name) && st.size < 20 * 1024 * 1024) out.push(p)
  }
}

function stripRuleComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

function checkDeploy(root) {
  const files = []
  walk(path.join(root, 'dist'), files)
  for (const f of files) {
    let text = ''
    try {
      text = readFileSync(f, 'utf8')
    } catch {
      continue
    }
    const found = findSecret(text)
    if (found)
      deny(`The built site (${path.relative(root, f)}) contains what looks like a ${found}. Anything in the build is public. Move the key to a server and rebuild.`)
  }

  const rulesPath = path.join(root, 'firestore.rules')
  if (existsSync(rulesPath)) {
    let rules = ''
    try {
      rules = stripRuleComments(readFileSync(rulesPath, 'utf8'))
    } catch {}
    if (/allow\s+[^:;{}]*\b(write|create|update|delete)\b[^:;{}]*:\s*if\s+true\s*(;|\}|$)/m.test(rules))
      deny('firestore.rules lets anyone change data (`allow write/create/update/delete: if true`). Restrict it (owner / own doc / members) before deploying. See the add-database skill.')
    if (/request\.time\s*<\s*timestamp\.date\(/.test(rules))
      deny('firestore.rules is still in Firebase "test mode" (open to everyone until a date). Replace it with real rules before deploying.')
  }
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
  const tool = input.tool_name
  const ti = input.tool_input || {}
  const cwd = input.cwd || process.cwd()
  const info = gitInfo(cwd)
  const project = findProject(cwd, info)

  // One session, one queue: no handing work to subagents, workflows or new sessions.
  if (project && AGENT_TOOLS.has(tool) && !agentsAllowed(info)) {
    deny0(
      `[vibe-launchpad] ${tool} is turned off in this project: do the work yourself in this session, one task-queue item at a time (.launchpad/todo.md, task-queue skill). Only if the owner explicitly asks for parallel work, follow the parallel-work skill (it explains how to allow it for this session).`,
    )
  }

  // A second session in the same folder may not edit files until it moves into a worktree.
  if (project && info && input.session_id && (tool === 'Write' || tool === 'Edit' || tool === 'MultiEdit')) {
    const me = touchSession(info, input.session_id)
    const conflict = folderConflict(info, me, activeOthers(info, input.session_id))
    if (conflict && conflict.iAmSecond && isInside(ti.file_path, info.top))
      deny0(
        `[vibe-launchpad] Another session is already working in ${info.top}. Editing the same folder from two sessions overwrites work. Warn the owner, and if they still want this session to work, move it into a git worktree on a new branch first (see the SECOND SESSION instructions and the parallel-work skill).`,
      )
  } else if (project && info && input.session_id) {
    touchSession(info, input.session_id)
  }

  if (tool === 'Write' || tool === 'Edit' || tool === 'MultiEdit') {
    const root = findRoot(ti.file_path ? path.dirname(ti.file_path) : cwd) || project
    if (root) checkWrite(ti)
  } else if (tool === 'Bash') {
    const cmd = String(ti.command || '')
    const root = project ? (info && info.top) || findRoot(cwd) || project : null
    if (root) {
      if (/\bgit\b/.test(cmd)) checkGit(root, cmd)
      if (/\bfirebase(?:-tools)?(?:@\S+)?\s+(?:deploy|hosting:channel:deploy)\b/.test(cmd)) checkDeploy(root)
    }
  }
} catch {
  // fail open
}
process.exit(0)
