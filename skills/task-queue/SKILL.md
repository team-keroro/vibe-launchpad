---
name: task-queue
description: Default way of working in a vibe-launchpad project - one session does everything, new requests are queued in a to-do list (.launchpad/todo.md) and done one at a time, with no subagents, workflows or new sessions. Use whenever the owner sends a request while another is in progress, asks what is left or in what order ("할 일 목록", "뭐 남았어?", "순서 바꿔줘", "이거 먼저 해줘", "목록에서 빼줘", "다음 거 해줘"), and when a new session sees a warning that another session is working in the same folder.
---

# One session, one queue

Why: the owner is a non-developer. One session that does things in order is easy to follow, never overwrites itself, and keeps everything in one conversation. Subagents and extra sessions make it hard to see what happened.

## The queue file

`.launchpad/todo.md` in the project (gitignored; create it if missing):

```markdown
# 할 일 목록

- [x] 1. 노래 목록 화면 만들기
- [ ] 2. 별점 투표 넣기  ← 지금 하는 중
- [ ] 3. 결과 페이지에 그래프
- [ ] 4. 버튼 색 더 진하게
```

Numbers never change once given (the owner may refer to "3번"). Mark the current item with `← 지금 하는 중`.

## When a message arrives

- **Correction or answer about the current item** ("그거 말고 파란색", "응 그렇게 해") → apply it now. Not a new item.
- **New request while working on something** → append it to the queue, reply in one line: "할 일 목록 4번에 넣었어요. 지금 하는 2번 끝나고 이어서 할게요." Then continue the current item.
- **"이거 먼저 해줘"** → move it to the front of the REMAINING items (keep its number) so it is next, but still finish the current item first. Never stop or abandon the item in progress to jump to another one. Reply: "5번을 바로 다음 차례로 옮겼어요. 지금 하는 2번 끝나면 바로 할게요." Only if the owner explicitly says to stop the current item ("지금 거 멈춰", "그만하고 이거 해") make a save point, mark it `(멈춤)` in the list, and switch.
- **Nothing in progress** → add it as an item and start it right away.
- Several requests in one message → one item each.

## Working the queue

1. Take the first unchecked item, mark it `← 지금 하는 중`. Exactly one item is in progress at any time; it is finished before anything else starts.
2. Do it yourself in this session. Never use subagents, workflows or new/handed-off sessions; the guard hook blocks them.
3. When it works: tests/build if relevant, a save point (`save-points`), check it off, and tell the owner in one or two lines what changed.
4. If this session runs in a git worktree (some hosts start sessions that way), land the finished item on `main` (parallel-work "Landing the work") so the running app shows it. Do NOT close the session.
5. Immediately start the next item. Between items, one short line is enough: "2번 끝! 이어서 3번 할게요."
6. When the queue is empty: "목록에 있던 건 다 끝났어요." Do not close the session on your own.

"뭐 남았어?" → show the list. "목록에서 빼줘" → remove after confirming which one.

## Parallel work is the exception

Only if the owner explicitly asks ("동시에 해줘", "에이전트 여러 개로", "병렬로") use the `parallel-work` skill. It explains how to unlock agents for this session.

## Another session in the same folder

If the session start or a message shows "다른 세션이 같은 폴더에서 작업 중이에요" (this session is the SECOND one):

1. Before editing anything, explain in plain Korean:
   - 같은 폴더에서 두 세션이 동시에 고치면 서로 덮어써요.
   - 그래서 이 세션은 워크트리(작업용 복사본)에서 작업해야 해요.
   - 워크트리에서 고친 건 지금 켜 둔 화면에 바로 안 보여요. 그래서 데이터 구조(스키마) 변경, 계산 로직, 테스트처럼 화면으로 확인하지 않아도 되는 작업을 맡기는 게 좋아요.
   - 아니면 이 요청을 첫 번째 세션의 할 일 목록에 넣는 방법도 있어요.
2. Ask whether to continue here. The guard blocks file edits in the shared folder until this session moves into a worktree.
3. If the owner says yes: follow `parallel-work` for exactly this one task (worktree on a new branch from `main` → do it → tests/build → land on `main` → ask "작업 다 했어요. 이 세션 닫을까요?" → close only after yes).
