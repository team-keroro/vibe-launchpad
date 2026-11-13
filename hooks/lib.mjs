// Shared helpers for vibe-launchpad hooks.
// Session presence: each Claude session working in a project writes a small heartbeat file
// under <git common dir>/vibe-launchpad/sessions/ (inside .git, so never committed and shared
// by all worktrees of the repo). A session counts as active if it was seen in the last
// ACTIVE_MINUTES. SessionEnd removes its file.
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  realpathSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

export const ACTIVE_MINUTES = 60
const STALE_MS = 24 * 60 * 60 * 1000

export const AGENT_TOOLS = new Set([
  'Agent',
  'Task',
  'Workflow',
  'mcp__ccd_session__start_session',
  'mcp__ccd_session__hand_off_to_session',
])

export function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}')
  } catch {
    return {}
  }
}

function real(p) {
  try {
    return realpathSync(p)
  } catch {
    return path.resolve(p)
  }
}

export function samePath(a, b) {
  return !!a && !!b && real(a) === real(b)
}

export function isInside(file, folder) {
  if (!file || !folder) return false
  const rel = path.relative(real(folder), real(path.dirname(file)))
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function findProfileUp(start) {
  if (!start) return null
  let dir = path.resolve(start)
  for (;;) {
    if (existsSync(path.join(dir, '.launchpad', 'profile.json'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/** Git facts for a folder: top (this checkout), common (.git dir), mainRoot, isWorktree. */
export function gitInfo(cwd) {
  try {
    const out = execFileSync(
      'git',
      ['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir'],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .trim()
      .split('\n')
    const [top, common] = out
    const mainRoot = path.basename(common) === '.git' ? path.dirname(common) : null
    return { top, common, mainRoot, isWorktree: mainRoot ? !samePath(top, mainRoot) : false }
  } catch {
    return null
  }
}

/** Project root that has .launchpad/profile.json (this checkout, else the main checkout). */
export function findProject(start, info) {
  const here = findProfileUp(start)
  if (here) return here
  if (info && info.mainRoot && existsSync(path.join(info.mainRoot, '.launchpad', 'profile.json')))
    return info.mainRoot
  return null
}

function sessionsDir(info) {
  return path.join(info.common, 'vibe-launchpad', 'sessions')
}

function safeId(id) {
  return String(id).replace(/[^A-Za-z0-9_-]/g, '_')
}

/** Record that this session is alive and where it works. Returns its record. */
export function touchSession(info, sessionId) {
  if (!info || !sessionId) return null
  const dir = sessionsDir(info)
  mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${safeId(sessionId)}.json`)
  let cur = {}
  try {
    cur = JSON.parse(readFileSync(file, 'utf8'))
  } catch {}
  const now = Date.now()
  const rec = {
    sessionId,
    folder: info.top,
    startedAt: cur.startedAt ?? now,
    lastSeen: now,
    warnedAbout: Array.isArray(cur.warnedAbout) ? cur.warnedAbout : [],
  }
  writeFileSync(file, JSON.stringify(rec))
  return rec
}

export function saveWarned(info, rec) {
  try {
    writeFileSync(path.join(sessionsDir(info), `${safeId(rec.sessionId)}.json`), JSON.stringify(rec))
  } catch {}
}

export function removeSession(info, sessionId) {
  if (!info || !sessionId) return
  try {
    unlinkSync(path.join(sessionsDir(info), `${safeId(sessionId)}.json`))
  } catch {}
}

/** Other sessions seen recently in this repo (any worktree). Cleans up very old files. */
export function activeOthers(info, sessionId) {
  const dir = sessionsDir(info)
  if (!existsSync(dir)) return []
  const now = Date.now()
  const out = []
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name)
    let rec
    try {
      rec = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      continue
    }
    if (now - (rec.lastSeen ?? 0) > STALE_MS) {
      try {
        unlinkSync(file)
      } catch {}
      continue
    }
    if (rec.sessionId === sessionId) continue
    if (now - (rec.lastSeen ?? 0) <= ACTIVE_MINUTES * 60 * 1000) out.push(rec)
  }
  return out
}

/**
 * Another active session in the SAME checkout folder as me.
 * The session that started first owns the folder; later ones are "second" sessions.
 */
export function folderConflict(info, me, others) {
  if (!me) return null
  const same = others.filter((o) => samePath(o.folder, info.top))
  if (!same.length) return null
  const iAmSecond = same.some((o) => (o.startedAt ?? 0) <= me.startedAt)
  return { same, iAmSecond }
}

/**
 * Parallel work is unlocked only while <git common dir>/vibe-launchpad/allow-agents-until
 * holds a future ISO date-time (written by the parallel-work skill when the owner asks).
 */
export function agentsAllowed(info) {
  if (!info) return false
  try {
    const until = Date.parse(readFileSync(path.join(info.common, 'vibe-launchpad', 'allow-agents-until'), 'utf8').trim())
    return Number.isFinite(until) && until > Date.now()
  } catch {
    return false
  }
}

export function minutesAgo(ts) {
  return Math.max(0, Math.round((Date.now() - (ts ?? 0)) / 60000))
}

const WARN_USER = (folder, mins) =>
  `⚠️ 다른 세션이 같은 폴더(${folder})에서 작업 중이에요 (마지막 활동 ${mins}분 전). ` +
  '같은 폴더에서 두 세션이 동시에 고치면 서로 덮어써요. 이 세션은 워크트리(작업용 복사본)로 옮겨서 작업해야 해요. ' +
  '워크트리에서 고친 내용은 지금 켜 둔 화면에 바로 보이지 않으니, 데이터 구조(스키마) 변경이나 계산 로직·테스트처럼 화면으로 확인하지 않아도 되는 작업을 맡기는 게 좋아요.'

const SECOND_SESSION_CONTEXT = (folder) =>
  `[vibe-launchpad] SECOND SESSION: another session is already active in ${folder}. ` +
  'Before editing anything: tell the owner in Korean that two sessions in one folder overwrite each other, that this session must work in a git worktree, and that worktree changes are not visible in the running app, so it suits work not checked on screen (schema/data-structure changes, logic, tests). ' +
  'Ask if they still want to continue here. If NO: suggest adding the request to the first session\'s queue instead and stop. ' +
  'If YES: move this session into a new worktree on a new branch from main (EnterWorktree tool if available, else `git worktree add ../<project>-wt-<task> -b agent/<task> main` and work only there). The guard blocks edits in the shared folder until then. ' +
  'When the task is done and tests + build pass: land it on main (parallel-work skill: commit, rebase on main, local --no-ff merge, push main if a remote exists, no PR), then ASK the owner "작업 다 했어요. 이 세션 닫을까요?" and close only after they say yes.'

export function conflictMessages(info, conflict) {
  if (!conflict || !conflict.iAmSecond) return null
  const newest = conflict.same.reduce((a, b) => ((a.lastSeen ?? 0) > (b.lastSeen ?? 0) ? a : b))
  return {
    user: WARN_USER(info.top, minutesAgo(newest.lastSeen)),
    context: SECOND_SESSION_CONTEXT(info.top),
    ids: conflict.same.map((o) => o.sessionId),
  }
}
