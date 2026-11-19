---
name: start-project
description: Start a new vibe-coding web app project for a non-developer. Use when the user wants to build/make a new website, web app, tool or service ("새 프로젝트 시작하자", "웹사이트 만들고 싶어", "앱 만들어줘", "이런 거 만들 수 있어?", "플레이리스트 랭킹 만들래", "점심 메뉴 추천 사이트"). Runs a short interview, classifies the project, scaffolds a Vite + React app with the kit's rules, and sets up Git save points.
---

# Start a project

The user is usually a non-developer. Speak their language (Korean by default), in plain words. Every technical word gets a short gloss in parentheses the first time, e.g. "배포(내 사이트를 인터넷에 올리는 것)".

## 0. Before anything

- If the current folder already has `.launchpad/profile.json`, this is an existing project: read it, summarize it in 2-3 lines, and ask what they want to add instead of starting over.
- If the current folder already contains an unrelated project (lots of files, its own package.json), do NOT scaffold into it. Propose a new sibling folder name and ask.
- Check tools quietly: `node -v` (need **22 or newer**), `git --version`. Current Vite and its build tool do not run on Node 20 and fail with a confusing "Cannot find native binding" error, so never scaffold on an older Node.
  - Node missing or older than 22, and a version manager is installed (`fnm`, `nvm`, `volta`): install/select Node 22 with it yourself (e.g. `fnm install 22 && fnm use 22`) and tell the user in one line.
  - Otherwise stop and guide the human to install the current LTS (22 or newer) from nodejs.org (it is their step: download + double-click installer). Do not continue until `node -v` shows 22+.
  - If `npm install` already ran under an older Node, delete `node_modules` and `package-lock.json` and install again under Node 22.

## 1. Interview (one message, only what is still unknown)

Do not re-ask anything the user already said. If they say "알아서", choose the recommended answers yourself and tell them what you chose.

Ask these, numbered, with the recommended answer marked:

1. **누가 쓰나요?** 나만 / 우리 팀·친구들(정해진 사람) / 누구나
2. **로그인이 필요한가요?** Show the login menu from the `add-login` skill (level 0-3) as a small table.
3. **저장할 데이터가 있나요?** 없음 / 내 것만 / 여러 사람이 같이 보는 데이터
4. **돈이 드는 키를 쓰나요?** (OpenAI, Claude, Gemini 같은 AI 기능 등) 아니오 / 예
5. **주소는?** 무료 주소(`내앱.web.app`)로 충분 / 내 도메인(.com 등, 연 1~2만 원)을 쓰고 싶음
6. **분위기는?** Show the mood list from the `design` skill (6 options).
7. **설명은 어느 수준이 편하세요?** 5살 / 중학생 / 고등학생 / 실무자 (default: 중학생). Store as `explainLevel`: `five-year-old` | `middle-school` | `high-school` | `pro`.

Then, unless the site stays on this computer only (나만 / type A), ask the **visitor statistics** question as a separate short message after the answers above, using the wording in the `add-analytics` skill step 1: why it helps (2-3 lines), "방문자 통계를 모을까요?" with 네 / 아니요 / 왜 필요한지 설명 듣기, and "잘 모르겠으면 안 하셔도 돼요". "알아서" does not mean yes here: record `"off"` unless they say yes. Only record the answer now; setup happens after the first deploy.

If the user picked a recipe ("노래 랭킹", "점심 추천", "추억의 게임"), pre-fill answers from `recipes/` and only ask what the recipe leaves open.

## 2. Classify

| Type | When | Stack |
|---|---|---|
| A. 나만 쓰는 도구 | only me, no sharing | local only; Git save points; no deploy unless asked |
| B. 팀 내부 도구 | specific people | Firebase Hosting + Auth level 3 (allowlist) + Firestore with allowlist rules |
| C. 공개 사이트 | anyone, no login, no shared data | Firebase Hosting only |
| D. 공개 + 회원/데이터 | anyone, login and/or shared data | Hosting + Auth level 1-2 + Firestore with owner rules |
| E. 공개 + AI 기능 | uses a paid API key at runtime | D + server proxy from `add-server`, spending limits from `api-keys` FIRST |

Before choosing E, always ask: "AI 결과를 미리 만들어 둘 수 있나요?" If the AI output can be generated once while building (by you, now) and stored as a data file, prefer that: no key in the app, no server, free. Explain this choice in one sentence.

Tell the user the type and why, in 2-3 sentences, then continue.

## 3. Scaffold

Project folder name: short English kebab-case from the idea (e.g. `song-ranking`).

1. `npm create vite@latest <name> -- --template react-ts` then `cd <name>` and `npm install`. Pin the Node version: write `22` to `.node-version` and add `"engines": { "node": ">=22" }` to package.json.
2. Tailwind + shadcn/ui: follow the current official shadcn Vite guide (`npx shadcn@latest init`). If a command asks interactive questions, pick defaults.
3. Vitest: `npm install -D vitest` and add `"test": "vitest run"` to package.json scripts.
4. Routing: `npm install react-router-dom`. Default rule: opening an item from a list puts its id in the URL (`/songs/:id`) so it is a deep link that can be shared and refreshed, unless the owner says otherwise. (`firebase.json` already rewrites every path to `index.html`, so these links work after deploy.)
5. Folders: `src/logic/` (pure functions + tests), `src/hooks/` (custom hooks), `src/components/`, `src/lib/` (setup such as `firebase.ts`), `src/data/` (static data files).
6. Copy kit templates from `${CLAUDE_PLUGIN_ROOT}/templates/`:
   - `CLAUDE.md` → project root (the full working rules; fill in the placeholders from the interview)
   - `AGENTS.md` → project root (a thin note for Codex: read CLAUDE.md, plus Codex-only safety notes; fill in the project name)
   - `gitignore` → `.gitignore` (merge with Vite's, keep `.env*` lines)
7. Write `.launchpad/profile.json`:

```json
{
  "name": "song-ranking",
  "idea": "친구들이 내 노래 20곡을 듣고 순위를 매기는 사이트",
  "type": "D",
  "audience": "friends",
  "loginLevel": 2,
  "data": "shared",
  "paidKeys": [],
  "domain": "free",
  "mood": "dark-studio",
  "explainLevel": "middle-school",
  "analytics": "off",
  "firebaseProjectId": null,
  "deployedUrl": null,
  "createdAt": "YYYY-MM-DD"
}
```

   `analytics` is `"wanted"` or `"off"` from the statistics question (`add-analytics` sets `"on"` later).

   `paidKeys` starts as `[]`, even if the answer to question 4 was 예 or "maybe later": never write provider names or notes there. Only the `api-keys` skill adds entries (objects with `provider`, `monthlyLimitUsd`, `limitSetOn`, `where`), when a key is actually added.

8. Apply the mood with the `design` skill, including its toast setup (Sonner, `src/lib/notify.ts`, one `<Toaster />` at bottom-center with 5-second auto-dismiss).
9. If a recipe was chosen, build its first version following the recipe file.
10. Git: `git init`, first save point via the `save-points` skill ("첫 시작").
11. Types B-E: run the `firebase-setup` skill now (or at the first "배포해줘" if the owner wants to see it locally first). The owner only makes a Firebase account and logs the CLI in once; you do the rest.

## 4. Finish

- Run it locally with the `run-local` skill and give them the link.
- Tell them in 3-5 short lines what was made and what they can say next. Always include:
  - "화면에서 바꾸고 싶은 걸 그냥 말로 하세요"
  - "모르는 단어는 '5살처럼 설명해줘'"
  - "망가지면 '아까 잘 되던 때로 되돌려줘'"
  - "다 되면 '배포해줘'"

## Recipes

- `recipes/song-ranking.md` — 친구들이 매기는 내 노래 랭킹
- `recipes/lunch-picker.md` — 오늘 뭐 먹지? 맛 점수 추천
- `recipes/retro-games.md` — 90·2000년대 추억의 게임 박물관 (아스키 아트 테마)

The `example` skill walks a first-timer through recipe 2 or the lunch picker from prompt to a shared link.
