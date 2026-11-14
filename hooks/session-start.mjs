#!/usr/bin/env node
// vibe-launchpad SessionStart hook.
// Inside a vibe-launchpad project: registers this session, adds a short project summary and
// the working rules to the session context, and warns (to the user) if another session is
// already working in the same folder. Elsewhere: prints nothing.
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  readInput,
  gitInfo,
  findProject,
  touchSession,
  activeOthers,
  folderConflict,
  conflictMessages,
  saveWarned,
} from './lib.mjs'

try {
  const input = readInput()
  const cwd = input.cwd || process.cwd()
  const info = gitInfo(cwd)
  const root = findProject(cwd, info)
  if (!root) process.exit(0)

  const p = JSON.parse(readFileSync(path.join(root, '.launchpad', 'profile.json'), 'utf8'))
  const memory = path.join(os.homedir(), '.vibe-launchpad', 'memory.md')
  const lines = [
    `vibe-launchpad project "${p.name ?? path.basename(root)}": ${p.idea ?? ''}`,
    `type ${p.type ?? '?'}, login level ${p.loginLevel ?? '?'}, data ${p.data ?? '?'}, explain level ${p.explainLevel ?? 'middle-school'}, deployed: ${p.deployedUrl ?? 'not yet'}.`,
    'Follow CLAUDE.md. The owner is a non-developer: plain Korean, gloss technical words, never "as I mentioned".',
    'Work style: one session, one task queue (.launchpad/todo.md, task-queue skill). Do every request yourself in this session, one item at a time. Never hand work to subagents, workflows or new sessions (the guard blocks them) unless the owner explicitly asks for parallel work (parallel-work skill).',
    `Owner's memory list: ${memory}${existsSync(memory) ? '' : ' (not created yet)'}.`,
  ]
  if (info && info.isWorktree)
    lines.push(
      'This session runs in a git worktree: land each finished queue item on main (parallel-work landing steps) so the running app sees it, but keep the session open while the queue has items; ask the owner before closing.',
    )

  // paidKeys entries are written by the api-keys skill: { provider, monthlyLimitUsd, limitSetOn, where }.
  // A plain string (e.g. "anthropic (optional)") is an interview note, not a key that was set up.
  // Neither case may take over the session: the owner's request comes first, and safety-check
  // still blocks deploys until every paid key has a recorded limit.
  const keys = Array.isArray(p.paidKeys) ? p.paidKeys : []
  const noLimit = keys.filter((k) => k && typeof k === 'object' && (k.monthlyLimitUsd == null || !k.limitSetOn))
  const notes = keys.filter((k) => typeof k === 'string' && k.trim())
  if (noLimit.length)
    lines.push(
      `Paid API key without a recorded monthly limit: ${noLimit.map((k) => k.provider || '?').join(', ')}. Mention it to the owner in one Korean line and offer the api-keys skill, then do what they asked; do not open the session with it. Run api-keys before new code uses the key and before any deploy.`,
    )
  if (notes.length)
    lines.push(
      `profile.json paidKeys holds plain-text notes (${notes.join(', ')}), not keys set up with limits. Ignore them unless the owner's request adds or uses a paid key; then run the api-keys skill and replace the note with its record.`,
    )

  let systemMessage
  if (info && input.session_id) {
    const me = touchSession(info, input.session_id)
    const msg = conflictMessages(info, folderConflict(info, me, activeOthers(info, input.session_id)))
    if (msg) {
      lines.push(msg.context)
      systemMessage = msg.user
      me.warnedAbout = [...new Set([...me.warnedAbout, ...msg.ids])]
      saveWarned(info, me)
    }
  }

  const out = { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') } }
  if (systemMessage) out.systemMessage = systemMessage
  process.stdout.write(JSON.stringify(out) + '\n')
} catch {
  // Never block a session because of this hook.
}
process.exit(0)
