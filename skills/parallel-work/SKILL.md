---
name: parallel-work
description: The EXCEPTION to the one-session task queue - how a second session or explicitly requested parallel agents work without overwriting each other. Each writer works in its own git worktree and branch; when its task is done it is landed on main (commit, local --no-ff merge into main, push main when there is a remote - never a PR), and the session is closed only after the owner confirms. Also holds the landing steps a worktree-based single session uses to put finished queue items on main. Use when a session is warned that another session works in the same folder and the owner wants to continue, when the owner explicitly asks for parallel work ("동시에 해줘", "병렬로", "에이전트 여러 개", "서브 에이전트", "워크트리"), and for "마무리", "머지해", "메인에 합쳐", "푸시해", "세션 닫아", "기록 남겨", "덮어썼어", "옛날 버전으로 돌아갔어".
---

# Worktree → commit → merge into main → push → (confirm) close

## When this applies

The normal way of working is the `task-queue` skill: ONE session, requests queued in `.launchpad/todo.md` and done one by one, no subagents, no new sessions. This skill is only for:

1. **A second session in the same folder** (it was warned "다른 세션이 같은 폴더에서 작업 중이에요") and the owner chose to continue there. That session moves into a worktree, does exactly one task, lands it, then asks before closing. The full "Every task follows this loop" and "Finishing a task" sections below apply to it.
2. **Parallel agents the owner explicitly asked for.** Unlock them first (see "Unlocking agents"), then follow "Before starting any parallel work".
3. **A single session the host started inside a worktree** (e.g. the Claude desktop app). It uses only "Landing the work" to put each finished queue item on `main`, and does NOT close the session after each item.

## Unlocking agents (only when the owner explicitly asked)

The guard hook blocks subagents, workflows and new sessions in launchpad projects. To unlock for a limited time, write a date-time at most 3 hours ahead (ISO 8601) into `<git common dir>/vibe-launchpad/allow-agents-until` (find the dir with `git rev-parse --path-format=absolute --git-common-dir`). Tell the owner in one line ("병렬 작업을 2시간 동안 켰어요"). Delete the file when the parallel work is landed.

Analogy for the user: each agent gets its own copy of the workbench (worktree) and its own notebook (branch). When it's done, its work is checked and glued into the main book (merge). The merge commit is the receipt that says who changed what and why.

Why this exists: when several agents edit one folder at once, they overwrite each other's files, half-finished files mix together, and the owner sees "old versions" come back. When nothing is committed, there is no way to tell what happened or to go back.

**No pull requests.** The owner does not want PRs. Never run `gh pr create`, never open a PR in a browser, never ask "PR 만들까요?". Work lands by a local merge commit into `main`, and `main` is pushed only if the project has a remote.

## Every task follows this loop (second sessions and parallel agents)

The owner expects every finished task to be on `main`. Work left on a branch or uncommitted in a worktree looks "lost" to them.

1. **Start in a worktree.** Before the first file edit, make sure you are in a worktree on a new branch cut from the current `main` tip (many hosts already start sessions in one, e.g. the Claude desktop app's `.claude/worktrees/<name>`). If you are in the main folder, create one first (see "Each writing agent" below). Read-only questions do not need one.
2. **Do the work** inside the worktree, with tests and build run there.
3. **Finish without being asked.** When the task is done and checked, go straight to "Finishing a task" below. Do not stop at "not committed yet" or ask "합칠까요?". Landing on `main` is part of the task.
4. **Stop and ask instead of landing** only when: tests or the build still fail, a conflict needs the owner's choice, the owner said to hold it ("아직 합치지 마", "검토하고 싶어"), or the work is half done. Then say what is missing in one or two Korean sentences and keep the session open.

## Finishing a task (land → clean up → close)

1. Commit everything that belongs to the task (English message, one-line summary first).
2. Bring in the latest `main` and re-run the tests and the build in the worktree, as in "Landing the work" below. Fix failures before going on.
3. Land it, as in "Landing the work" below: `git merge --no-ff <branch>` in the main folder, then push `main` if the project has a remote. Do not land it if the main folder has uncommitted changes. Tell the owner and ask instead.
4. If a dev server is running from the main folder, check one changed file is served so the owner's running app sees the change.
5. Report in Korean: what changed (one or two lines), the merge commit, whether it was pushed, test/build results, then ask **"작업 다 했어요. 이 세션 닫을까요?"** and wait. If the owner says no or asks for more, keep the session open (remove nothing) and continue.
6. **Only after the owner says yes, close the session and clean up:**
   - If the host has a tool to archive or close the current session (Claude desktop app: the session archive tool), call it as the very last action. Archiving removes the session's own worktree, so do not `git worktree remove` the folder you are running in before it.
   - Otherwise (terminal CLI), leave the worktree folder you are standing in, remove it from the main folder (`git worktree remove <path>`), delete the merged local branch, and end with "다 끝났어요. 이 창은 닫으셔도 돼요."
   - Never close a session that another session is still waiting on, or one the owner is still talking in about something else. Finish that first or ask.

## Before starting any parallel work

1. The project must be a git repo with a clean starting point. If there are uncommitted changes, make a save point first (`save-points`): "저장 포인트 만들었어요: '<summary>'".
2. Plan the split. Each agent gets one task and a clear list of folders/files it owns. Two writers must never own the same file. Work that touches shared files (shared types, the main server file, AGENTS.md) runs one at a time, not in parallel.
3. Agents that only read (review, research) may share the main folder. Every agent that WRITES gets its own worktree.

## Each writing agent

- Create its worktree on a new branch from the current `main` tip:
  `git worktree add ../<project>-wt-<task> -b agent/<task> main`
  (or the tool's built-in isolation, e.g. a workflow agent option `isolation: "worktree"`).
- It works and runs tests and build ONLY inside its worktree. It commits there with English messages ending in a one-line summary of the task.
- Data folders, databases, `.env*` and other gitignored local state are never deleted, reseeded or copied over. Tests use temporary copies (for example `SCOUT_DB=/tmp/<task>.db`). A worktree that needs `.env` gets it copied or symlinked, never committed.
- It never runs servers on the owner's ports. Pick a free port and stop it when done.
- When done, it reports the branch name, what changed, test/build results and anything unfinished.

## Landing the work (one branch at a time)

Find the main folder with `git worktree list --porcelain` (the worktree whose branch is `main`). Check for a remote with `git remote` (empty output = no remote).

1. **Catch up `main`.** If there is a remote, first update the main folder: `git -C <main folder> pull --ff-only` (if that fails because local `main` and the remote diverged, stop and ask the owner; never force anything).
2. **Update the branch.** In the worktree, rebase onto the local `main` (`git rebase main`), then re-run the tests and the build there.
3. **Merge locally** in the main folder, without fast-forward so the history keeps the unit of work:
   `git -C <main folder> merge --no-ff <branch> -m "Merge <branch>: <summary>"`.
4. **Push if there is a remote.** `git -C <main folder> push origin main` (use the remote's actual name if it is not `origin`). With no remote, skip this step and say "원격 저장소가 없어서 내 컴퓨터에만 합쳤어요".
   - Push only `main`. Do not push the task branch and do not open a PR.
   - If the push is rejected because the remote moved, `pull --ff-only` again only if it is a plain fast-forward; otherwise stop and ask. Never `push --force`.
   - Do not create a remote/GitHub repo without the owner's OK. If they want one, run `safety-check` first and make it private by default (see `save-points`).
5. After each merge, run the full tests on `main` before landing the next branch. If something broke, fix it on a new branch; never force-push or `reset --hard`.
6. Remove the finished worktree (`git worktree remove <path>`) and delete the merged local branch. The merge commit keeps the record.
7. Tell the owner in Korean, one line per landed piece: "합쳤어요: '카테고리별 기준' (병합 커밋 abc123, 푸시 완료)".

## Conflicts

- Resolve file by file, keeping both sides' intent. Prefer `main` for lockfiles and generated files and regenerate them.
- If two branches changed the same behaviour in different ways, stop and ask the owner which one they want. Do not pick silently.
- Never resolve a conflict by overwriting with one side wholesale without reading both.

## What the owner can ask

- "마무리해" / "다 됐어" / "머지해" / "메인에 합쳐" → "Finishing a task" above, including the question before closing. In a normal single session (task-queue) this means: land what is finished, and close only if the owner confirms.
- "지금 누가 뭐 하고 있어?" → list the active worktrees/branches, each with its task and status.
- "어제 버전 보여줘" / "되돌려줘" → `save-points` (restore as a new commit; history is never rewritten).
- "기록 보여줘" → `git log --oneline --graph -20` explained in plain Korean, merges first.
