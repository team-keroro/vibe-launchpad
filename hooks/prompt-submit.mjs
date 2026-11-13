#!/usr/bin/env node
// vibe-launchpad UserPromptSubmit hook.
// On every owner message inside a vibe-launchpad project: refreshes this session's heartbeat,
// reminds Claude of the one-session task queue, and warns once if another session has started
// working in the same folder since the last warning.
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

const QUEUE_REMINDER =
  '[vibe-launchpad] Task queue: if you are in the middle of a task and this message is a NEW request (not a correction or answer about the current task), append it to .launchpad/todo.md, tell the owner its number in one Korean line, and finish the current item first. Never stop the item in progress to jump to a new one, even for "이거 먼저" (that only moves it to be next), unless the owner explicitly says to stop the current item. Corrections to the current task apply right away. When an item is done, mark it done and start the next one. Do the work yourself in this session: no subagents, workflows or new sessions unless the owner explicitly asked for parallel work.'

try {
  const input = readInput()
  const cwd = input.cwd || process.cwd()
  const info = gitInfo(cwd)
  const root = findProject(cwd, info)
  if (!root) process.exit(0)

  const context = [QUEUE_REMINDER]
  let systemMessage

  if (info && input.session_id) {
    const me = touchSession(info, input.session_id)
    const conflict = folderConflict(info, me, activeOthers(info, input.session_id))
    const msg = conflictMessages(info, conflict)
    if (msg) {
      context.push(msg.context)
      const fresh = msg.ids.filter((id) => !me.warnedAbout.includes(id))
      if (fresh.length) {
        systemMessage = msg.user
        me.warnedAbout = [...new Set([...me.warnedAbout, ...fresh])]
        saveWarned(info, me)
      }
    }
  }

  const out = { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context.join('\n') } }
  if (systemMessage) out.systemMessage = systemMessage
  process.stdout.write(JSON.stringify(out) + '\n')
} catch {
  // never block the owner's message
}
process.exit(0)
