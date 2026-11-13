# Changelog

## 0.3.0 — 2026-11-12
- `parallel-work` now covers every task, not only parallel agents. Edits happen in a git worktree. When the task is done and tested, it lands on `main` without asking: PR + merge, or a local `--no-ff` merge with no GitHub remote. Then the main folder is refreshed, the owner gets a Korean report, and the session closes: archived when the host can, otherwise the worktree and branch are removed. Landing stops and asks when tests fail, a conflict needs a choice, or the owner said to hold.
- SessionStart hook, `templates/AGENTS.md`, `save-points`, README and the magic-phrases card state the rule ("마무리해", "머지해").

## 0.2.0 — 2026-11-12
- New skill `parallel-work`: when several agents work at once, each writer gets its own git worktree and branch. Work lands through a PR, or a local `--no-ff` merge when there is no GitHub remote. `main` is re-tested before the next branch lands. Agents never delete or reseed data and never stop the owner's servers.
- `save-points` now points to `parallel-work` for multi-agent work.
- `templates/AGENTS.md`: new "Parallel work" section.
- README: skill table lists `parallel-work`.

## 0.1.0
- Initial kit: start-project, design, logic-and-tests, save-points, safety-check, run-local, deploy, add-login, add-database, add-server, api-keys, add-domain, explain, remember.
