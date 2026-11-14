# {{PROJECT_NAME}} — notes for Codex

This project is built mainly with Claude Code. Its working rules are in `CLAUDE.md`: **read it first and follow it.** The notes below are only for Codex.

## Codex-only notes (Claude Code has hooks that do these; you don't)

- Before writing a file, make sure no secret key goes in (`sk-`, `sk-ant-`, `sk_live_`, `rk_live_`, `ghp_`, `github_pat_`, `xox`, `AKIA`, `-----BEGIN PRIVATE KEY`). The Firebase web `apiKey` is fine.
- Before every commit and push, check `git diff --cached` and the commits being pushed: no `.env*` (except `.env.example`), `.dev.vars`, `*.pem` or service-account JSON, and no keys.
- Before every deploy, run the safety check from `CLAUDE.md` (secrets in `dist/`, Firestore rules never `if true` for writes and never test mode).
- Work alone in one session, one item at a time from `.launchpad/todo.md`; no subagents or parallel agents unless the owner asks.
- If Claude Code may be working in this same folder right now, ask the owner before editing; two agents in one folder overwrite each other.
- `${CLAUDE_PLUGIN_ROOT}` and plugin skill names in `CLAUDE.md` refer to Claude Code; if you can't reach them, do the step by hand or ask the owner.
