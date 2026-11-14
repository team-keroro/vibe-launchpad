---
name: run-local
description: Run the project on the user's own computer and explain what localhost means. Use when the user wants to see/try/open their app locally ("실행해줘", "켜줘", "보여줘", "미리보기", "내 폰에서 보고 싶어", "왜 친구 폰에서는 안 열려?", "localhost 안 열려").
---

# Run locally

1. Install dependencies if `node_modules/` is missing: `npm install`.
2. Start the dev server in the background: `npm run dev -- --host` (`--host` lets phones on the same Wi-Fi connect).
3. Give the user two links:
   - 이 컴퓨터에서: `http://localhost:<port>`
   - 같은 와이파이의 내 폰에서: the "Network" address Vite prints (e.g. `http://192.168.0.12:<port>`)
4. The first time in a project, explain in 3 lines (adapt to their explain level):
   - 지금 사이트는 "내 방 안의 가게"예요. 이 컴퓨터가 켜져 있고, 이 창이 열려 있을 때만 열려요.
   - 같은 와이파이의 내 폰은 들어올 수 있지만, 밖에 있는 친구 폰에서는 안 열려요.
   - 누구나 언제든 열 수 있게 하려면 "배포해줘"라고 하세요.
5. If the browser pane / preview tool is available, open it there.

## Common problems (explain plainly, then fix)

| Symptom | Plain explanation | Fix |
|---|---|---|
| Port already in use | 그 방에 이미 다른 프로그램이 있어요 | stop the old server or let Vite pick another port |
| Phone can't connect | 폰과 컴퓨터가 다른 와이파이거나, 회사 와이파이가 막고 있어요 | same Wi-Fi; otherwise deploy |
| Blank page | 화면 코드에 오류가 있어요 | read the browser console, fix, and tell the user what broke in one line |
| `npm` not found | Node 가 아직 설치 안 됐어요 | human step: install Node 22+ (LTS) from nodejs.org |
| "Cannot find native binding" / Vite won't start | 컴퓨터의 Node 가 너무 옛날 버전이에요 (22 이상 필요) | switch to Node 22+ (`fnm`/`nvm` if installed, else human step from nodejs.org), then delete `node_modules` + `package-lock.json` and `npm install` again |
