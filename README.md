# vibe-launchpad

A Claude Code plugin for non-developers who vibe-code web apps. It interviews you at the start, sets up a project with safe defaults, puts it online for free with Firebase, guards against leaked API keys and runaway costs, and helps you learn along the way (explanation ladder, personal memory list).

## Install

From a Claude Code session (any folder):

```
/plugin marketplace add team-keroro/vibe-launchpad
/plugin install vibe-launchpad@vibe-launchpad
```

Or from a terminal:

```bash
claude plugin marketplace add team-keroro/vibe-launchpad
claude plugin install vibe-launchpad@vibe-launchpad
```

Not comfortable with commands? Ask Claude Code in Korean:
"team-keroro/vibe-launchpad 플러그인 마켓플레이스를 추가하고 vibe-launchpad 플러그인을 설치해 줘."

Working on the plugin itself from a local clone: `claude plugin marketplace add /path/to/vibe-launchpad`, then run
`/reload-plugins` in an open session (or start a new session) after editing files.

The plugin works through Claude Code, so it needs a Claude subscription (Pro or Max) and everything it does is
counted against that subscription's usage.

## What's inside

| Skill | Say this (Korean) | What it does |
|---|---|---|
| `example` | `/example`, "예제 해 볼래" | Follow-along examples (lunch picker, retro games museum with an ASCII-art theme): show the prompt, ask before running, build, deploy, share |
| `start-project` | "새 프로젝트 시작하자" | Interview → project type → Vite + React + Firebase scaffold, CLAUDE.md rules, Git |
| `explain` | "5살처럼 설명해줘", "한 단계 더" | Explanation ladder (5살 → 중학생 → 고등학생 → 실무자) |
| `remember` | "기억해 둬", "내 기억 목록 줘", "퀴즈 내 줘" | Personal memory list at `~/.vibe-launchpad/memory.md` |
| `run-local` | "실행해줘" | Local run + what localhost means |
| `design` | "예쁘게 해줘", "분위기 바꿔줘" | Mood presets + shadcn/ui, Cult UI, Magic UI, Aceternity UI |
| `add-login` | "로그인 넣어줘" | Login level menu 0-3 with Firebase Auth |
| `add-database` | "저장되게 해줘" | Firestore with deny-by-default rules |
| `firebase-setup` | "파이어베이스 연결해줘" | Owner makes a Firebase account and logs the CLI in once; Claude drives the rest with the Firebase CLI (project, web config, Firestore, login providers) |
| `deploy` | "배포해줘" | Safety check → Firebase Hosting (free `*.web.app`) |
| `add-analytics` | "방문자 통계 붙여줘", "몇 명이 봤어?" | Visitor statistics with Google Analytics (free). Asked at project start with a short why and an easy no; after the first deploy the owner reads the steps, clicks the link last and accepts once; Claude checks with the CLI, adds the code, events, a footer notice and a `/privacy` page, and redeploys |
| `share` | "QR 코드 만들어줘", "공유 카드" | After deploy: link + message, QR code image, share card (title + QR + address), or a KakaoTalk/SNS link preview |
| `add-domain` | "내 도메인 연결" | Buy (human) + connect a custom domain |
| `add-server` | "AI 기능 넣고 싶어" | Avoid a server if possible; else Cloudflare Workers proxy with limits |
| `api-keys` | "API 키 넣어줘" | Spending limits before keys; leak response |
| `safety-check` | "안전 점검해줘" | Secrets, rules, limits, tests, build |
| `save-points` | "저장해 둬", "되돌려줘" | Git save points and restore; optional private GitHub backup |
| `logic-and-tests` | "테스트 돌려줘" | Components / hooks / pure logic split with Vitest |
| `task-queue` | (just keep asking), "뭐 남았어?", "이거 먼저 해줘" | Default way of working: one session, requests queued in `.launchpad/todo.md`, done one at a time; no subagents or new sessions |
| `parallel-work` | "마무리해", "머지해", "동시에 해줘", "메인에 합쳐" | Exception path: a second session in the same folder (after a warning) or owner-requested parallel agents work in their own git worktree + branch, land on `main` (local `--no-ff` merge, push if there is a remote — no PRs), then ask before closing |

Hooks (active only inside projects that have `.launchpad/profile.json`):

- `hooks/session-start.mjs` — registers the session, adds a project summary and the work rules, and warns if another session is already working in the same folder.
- `hooks/prompt-submit.mjs` — on each message: task-queue reminder, session heartbeat, warning when another session appears in the same folder.
- `hooks/guard.mjs` — blocks subagents/workflows/new sessions (unless parallel work was unlocked), blocks file edits from a second session in the same folder until it moves to a worktree, blocks writing secret keys into code, committing/pushing secret files or keys, and deploying with keys in the build or open Firestore rules.
- `hooks/session-end.mjs` — removes the session's heartbeat.
- `hooks/lib.mjs` — shared helpers. Session heartbeats live in `<git common dir>/vibe-launchpad/sessions/` (inside `.git`, never committed); a session counts as active if seen in the last 60 minutes.

Templates: `templates/CLAUDE.md` (the project's working rules; Claude Code is the main agent), `AGENTS.md` (thin Codex support: points to CLAUDE.md and adds the safety checks Claude's hooks do), `gitignore`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`.

Recipes: `skills/start-project/recipes/` — song ranking, lunch picker, retro games museum.

## Requirements

Node.js 22+ (the hooks and the apps use it; current Vite does not run on Node 20), Git, a Google account for Firebase. The Firebase CLI (`firebase-tools`) is installed per project by the plugin; the only manual Firebase steps are signing in to the Firebase console once and running `npx firebase-tools@latest login` once per computer.

## Validate

```bash
claude plugin validate .
```

## Quick card for users

See [docs/magic-phrases.ko.md](docs/magic-phrases.ko.md).
