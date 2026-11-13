#!/usr/bin/env node
// vibe-launchpad SessionEnd hook: removes this session's heartbeat so other sessions
// stop seeing it as active.
import { readInput, gitInfo, removeSession } from './lib.mjs'

try {
  const input = readInput()
  const info = gitInfo(input.cwd || process.cwd())
  if (info) removeSession(info, input.session_id)
} catch {}
process.exit(0)
