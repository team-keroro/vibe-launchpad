# Changelog

## 0.8.0 — 2026-11-18
- New skill `add-analytics`: visitor statistics with Google Analytics on the free plan. `start-project` asks once ("방문자 통계를 모을까요?") with a two-line why, an "explain more" option and "잘 모르겠으면 안 하셔도 돼요"; the answer goes to `profile.json` → `analytics`. After the first deploy, `deploy` runs it when wanted: the owner gets the steps first and the console link last, accepts the terms once, says "다 했어", and Claude checks `measurementId` with the CLI, adds `src/lib/analytics.ts` (live site only, a few key events), a footer line and a `/privacy` page as the Google Analytics terms require, and redeploys.
- `templates/CLAUDE.md`: any web page the owner must visit is explained steps-first, link-last, and checked with the CLI afterwards; records the analytics setting.

## 0.7.2 — 2026-11-14
- Links to other sites open in a new tab by default: one shared `ExternalLink` component (`target="_blank" rel="noopener noreferrer"`), internal links stay React Router `<Link>`. Added to `design` "Polish" (item 7) and the Code structure rules in `templates/CLAUDE.md`.

## 0.7.1 — 2026-11-14
- `design` "Polish": clickable things show the hand cursor on desktop. Tailwind v4 resets buttons to the arrow, so a base CSS rule restores `cursor: pointer` for buttons, links, `role="button"` and form controls (`not-allowed` when disabled); clickable cards must be `<button>`/`<a>`; draggable things use `cursor-grab`. `templates/CLAUDE.md` records the rule.

## 0.7.0 — 2026-11-14
- New skill `example` (`/example`, or say "예제 해 볼래"): two follow-along examples for first-timers — the lunch picker and a 90s/2000s retro games museum. It shows the exact prompt, asks before running (changes and add-ons welcome), builds through `start-project`, then asks before deploying and sharing.
- New recipe `retro-games.md`: researched game data, YouTube embeds checked via oEmbed, free-license images only with credits, ASCII art when no image is free, deep-linked detail pages, and the `ascii-terminal` theme.
- `design`: new mood `ascii-terminal` (dark navy, cyan + magenta neon, Galmuri11 pixel Korean + JetBrains Mono, box-drawn windows, scanlines, blinking cursor).
- New skill `share` with `make-share.mjs`: QR code (PNG/SVG) and a 1200×630 share card in the site's colors, optional `og:image` link preview, and a ready-to-paste message. `deploy` offers it after publishing.

## 0.6.1 — 2026-11-14
- Claude Code is the main agent. The full project rules moved from `templates/AGENTS.md` to `templates/CLAUDE.md` (no import), so Claude no longer reads Codex-only text. `templates/AGENTS.md` is now a thin Codex note: read `CLAUDE.md`, plus the safety checks that Claude's hooks do automatically. `design`, `start-project`, `parallel-work`, the SessionStart hook and README point to `CLAUDE.md`. Existing projects are unchanged.

## 0.6.0 — 2026-11-13
- `design`: new "Polish" section, the finishing touches every card/list/media app gets by default: a three-size type scale as `type-*` utilities, poster-first loading with fade-in for videos and images, drag feedback (tint + next card grows in, numbers in tested logic), user picks saved by id in `localStorage` with a tolerant restore and a remove button, an ending screen ("오늘은 이거!" random pick with re-roll), and `prefers-reduced-motion` support. `templates/AGENTS.md` records the type scale and motion.

## 0.5.1 — 2026-11-13
- New skill `firebase-setup`: the owner only makes a Firebase account and logs the CLI in once; Claude drives the rest with the Firebase CLI (project, web config, Firestore, login providers, hosting). `deploy`, `add-login`, `add-database`, `add-domain`, README and the magic-phrases card point to it instead of console clicks.
- `start-project` installs React Router and makes deep links (`/items/:id`) the default; `templates/AGENTS.md` records the rule.
- Node 22 or newer is now required. `start-project` checks for 22+, switches with fnm/nvm/volta when one is installed, pins `.node-version` and `engines`; `run-local` explains the "Cannot find native binding" error that current Vite gives on Node 20. README and `templates/AGENTS.md` updated.
- `design`: new "Spacing rhythm" section. Text-heavy groups (title + subtitle, rating/gauge rows, hint text between components, section headings) get more room between groups than inside them; image areas, thumbnail strips and toolbars stay tight. `templates/AGENTS.md` records the chosen spacing.

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
