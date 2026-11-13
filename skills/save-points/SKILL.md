---
name: save-points
description: Git save points for non-developers - save the current working state, list past states in plain words, go back to when it worked, and optionally back up to a private GitHub repo. Use when the user wants to save progress, undo, roll back, or back up ("저장해 둬", "세이브", "되돌려줘", "아까 잘 되던 때로", "망가졌어", "원래대로", "어제 버전", "GitHub에 백업", "깃허브에 올려줘").
---

# Save points (Git)

Analogy to use: Git = game save points on this computer. GitHub = copying the save file to an internet safe (optional).

## Save

- When: after something works (user says "좋아", "됐다"), before risky changes (big redesign, new feature), before deploy, and when the user asks.
- `git add -A` then `git commit -m "<short English summary>"`. Keep commit messages English but tell the user in Korean: "저장 포인트 만들었어요: '노래 투표 화면 완성'".
- Proactively suggest a save point when a feature starts working. Don't ask every time for tiny edits.
- If `git` is not initialized: `git init` (first time) and set a local identity if missing (`git config user.name` / `user.email` with values the user gives; don't invent an email).

- Every finished task lands on `main` and the session closes (`parallel-work`, "Finishing a task").
- Several agents working at once: always use the `parallel-work` skill (one worktree and branch per agent, then a local merge into `main`, pushed if there is a remote). Never let parallel agents write in the same folder.

## List

`git log --oneline -15` → show as a numbered list with plain-Korean descriptions and relative times ("2시간 전: 투표 화면 완성").

## Go back

1. Show the list, ask which one ("잘 되던 때").
2. Save the current state first as a safety net ("되돌리기 전 상태"), so nothing is lost.
3. Restore files to the chosen point without rewriting history: `git restore --source=<hash> --worktree --staged -- .` (or `git checkout <hash> -- .`), then commit "Restore to <hash>".
4. Confirm: "그때로 돌아왔어요. 마음이 바뀌면 방금 상태로도 다시 갈 수 있어요."

Never use `git reset --hard`, `git push --force`, or delete branches for this flow.

## GitHub backup (optional)

Only if the user asks. Explain: not required; useful if the computer is lost or to work with others.

1. Run `safety-check` first (GitHub is where keys leak most).
2. Human steps: create a GitHub account if needed; authenticate (`gh auth login` if GitHub CLI is installed; the user approves in the browser).
3. Create a **private** repo by default: `gh repo create <name> --private --source . --push`. Public only if the user explicitly asks, after confirming no secrets and that they are OK with anyone reading the code.
4. Later backups: "백업해줘" → `git push`.
