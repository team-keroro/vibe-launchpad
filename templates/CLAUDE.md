# {{PROJECT_NAME}} — AI working rules

Made with vibe-launchpad. Claude Code is the main agent; these are its rules. (`AGENTS.md` points Codex here and adds a few Codex-only notes; Claude does not need it.)

## Project

- Idea: {{IDEA}}
- Type: {{TYPE}} (A local only · B internal · C public site · D public + login/data · E public + AI/server)
- Login level: {{LOGIN_LEVEL}} (0 none · 1 email · 2 Google · 3 allowlist)
- Data: {{DATA}}
- Paid API keys: {{PAID_KEYS}}
- Hosting: Firebase Hosting (Spark free plan). Free address: {{DEPLOYED_URL}}
- Settings file: `.launchpad/profile.json` (keep it updated when choices change)

## Talking to the owner

- The owner is not a developer. Reply in Korean, plain words. Gloss every technical word the first time: "배포(사이트를 인터넷에 올리는 것)".
- Never say "as I mentioned / 앞에서 말했듯이". Re-asking is welcome; answer with a fresh analogy.
- Explanation ladder: "5살처럼" → "중학생" → "고등학생" → "실무자"; "한 단계 더" goes up one level. Default level: {{EXPLAIN_LEVEL}}.
- When the owner says "기억해 둬", append to `~/.vibe-launchpad/memory.md` (sections: 개념, 보안·비용, 내 프로젝트, 마법의 한마디).
- When a step needs the human (sign-up, login approval, payment, console clicks, DNS), stop and give click-by-click guidance, then wait.

## Stack

Vite + React + TypeScript + Tailwind + shadcn/ui, Vitest, Firebase (Hosting, Auth, Firestore). No Next.js, no Cloud Functions, no Storage unless the owner agrees to the Blaze plan.

Node 22 or newer (pinned in `.node-version` and package.json `engines`). Current Vite does not run on Node 20.

## Code structure (kitchen vs dining hall)

- `src/logic/` pure functions + `*.test.ts` (Vitest). All calculations, sorting, scoring, validation, permission decisions live here.
- `src/hooks/` custom hooks: state, Firebase/fetch calls; they call logic functions.
- `src/components/` UI only. No Firebase imports, no business rules.
- After changing `src/logic/`, run `npm test` and report the result in one line.
- Deep links by default: opening an item from a list (a post, a song, a dish) changes the URL to include its id (e.g. `/posts/:id`, React Router), so the link can be shared, refreshed and bookmarked. Only skip this if the owner says otherwise.

## Design

- Mood: {{MOOD}}
- Colors / fonts: {{DESIGN_TOKENS}}
- Type scale: `type-title` / `type-body` / `type-caption` utilities in `src/index.css`; no other text sizes in app components (design skill "Polish").
- Cursor: everything clickable shows the hand pointer on desktop (base rule in `src/index.css`; clickable cards are `<button>`/`<a>`; draggable things use `cursor-grab`). An arrow over something clickable is a bug.
- Motion: {{MOTION}} (design skill "Polish": loading shows a poster then fades in, drags tint toward the choice, `prefers-reduced-motion` respected)
- Component packages: {{PACKAGES}} (free components only, max 2 packages)
- Spacing: {{SPACING}} (design skill "Spacing rhythm": more space between text groups than inside them; images, thumbnails and toolbars stay tight)
- Keep this look on every change; use theme CSS variables, not hard-coded colors.

## Messages (toasts)

- Success and error messages are toasts (Sonner via shadcn/ui). No `alert()`, no ad-hoc banners.
- Always use `notify.success / error / info / warning` from `src/lib/notify.ts`; one `<Toaster {...TOASTER_DEFAULTS} />` in `App.tsx`.
- Defaults: bottom-center, auto-dismiss after 5 seconds. Only when the owner asks (or the user must act on it) pass `{ persistent: true }` so it stays until closed.
- Call toasts from hooks or event handlers, never from `src/logic/`. Short plain Korean: what happened, and what to do next if it failed.

## Safety (never break these)

- API keys are credit cards. Before adding any paid key: set a monthly limit with the provider and record it in `.launchpad/profile.json` → `paidKeys`.
- Secret keys never go in frontend code, `VITE_*` variables, Git, or chat. Server-side secrets only (Worker/Functions secrets, gitignored `.env` / `.dev.vars`).
- Prefer generating AI results at build time into `src/data/` over calling a paid API at runtime.
- Firestore rules: deny by default; never `allow read, write: if true`; never test-mode rules. Enforce access in rules, not only in the UI.
- Images: licensed sources with credit (e.g. Unsplash) or self-made; no scraped images.
- Before deploy or GitHub push: run the safety check (secrets, rules, limits, tests, build).

## Save points (Git)

- Commit when something starts working, before risky changes, and before deploy. Commit messages in English; tell the owner in Korean.
- "되돌려줘" = restore files from an earlier commit and commit that; never `reset --hard` or force-push.
- GitHub is optional; if used, private repo by default.

## How work runs: one session, one queue

- One session does everything, itself. No subagents, no workflows, no new or handed-off sessions (the guard hook blocks them in Claude Code).
- New requests that arrive while working go to the to-do list `.launchpad/todo.md` (numbered, gitignored); tell the owner the number in one line and finish the current item first. Never stop the item in progress to jump to another one; "이거 먼저" only makes it the next item. Corrections to the current item apply right away.
- Finish an item → save point → check it off → start the next item. Never close the session on your own; when the list is empty, say so.
- If the session runs inside a git worktree (host default), land each finished item on `main` (local `git merge --no-ff`, push `main` if there is a remote, never a pull request) so the running app sees it.
- Details: the `task-queue` skill.

## Exceptions: a second session, or parallel work the owner asked for

- If another session is already working in this same folder, a new session must not edit it (two sessions overwrite each other). Warn the owner; a second session suits work not checked on screen (schema/data-structure changes, logic, tests). If they still want it, the second session works in its own git worktree on a new branch, lands the task on `main` when tests + build pass (`--no-ff` merge, push `main` if there is a remote, no PR), then asks "작업 다 했어요. 이 세션 닫을까요?" and closes only after yes.
- Parallel agents only when the owner explicitly asks: save point first, one worktree and branch per writing agent, each agent owns its files, land one branch at a time and re-test `main` in between.
- Agents never delete or reseed data folders or databases, and never stop the owner's running servers.
- Details: the `parallel-work` skill.
