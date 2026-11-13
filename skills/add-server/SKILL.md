---
name: add-server
description: Decide whether the app really needs a server and, if so, add one as cheaply and safely as possible (prefer free, no credit card). Use when the user wants backend code, to call a paid API (OpenAI, Claude, Gemini) from the app, scheduled jobs, webhooks, or hide a secret ("서버 필요해?", "AI 기능 넣고 싶어", "API 연결", "키 숨기기", "백엔드", "매일 자동으로").
---

# Server: as little as possible, free first

## Step 1: try to avoid it

Ask these in order and stop at the first "yes":

1. Can the result be made in advance? (AI-generated text, scores, descriptions) → generate it now while building and save to `src/data/`. No server, no key, free.
2. Is it just storing/sharing data with rules? → Firestore + security rules (`add-database`). No server.
3. Is it login/permissions? → Firebase Auth + rules. No server.

Explain in one sentence why no server is better: free, nothing to leak, nothing to break.

## Step 2: if a server is truly needed

Typical real reason: calling a paid API with a secret key at runtime.

**Before writing any server code, run the `api-keys` skill** (spending limits first).

Options:

| Option | Card needed | Notes |
|---|---|---|
| **Cloudflare Workers (recommended default)** | No | free daily request quota; `npx wrangler login` (human approves in browser); secrets via `npx wrangler secret put` |
| Firebase Cloud Functions | Yes (Blaze) | free monthly quota but requires a card; budgets only ALERT, they do not stop spending |

Let the user choose; recommend Workers unless they want everything in Firebase and accept registering a card.

## Workers proxy pattern (for AI APIs)

- Folder `server/` with its own `wrangler.toml` (or `wrangler.jsonc`) and `src/index.ts`.
- The key lives only in Worker secrets. Never in frontend code, never in Git. Local dev secrets go in `server/.dev.vars` (gitignored).
- Required protections in the Worker:
  1. **Origin check**: only accept requests from the app's domains (`*.web.app`, custom domain, localhost in dev).
  2. **Auth check** if the app has login: verify the Firebase ID token (or at least require it).
  3. **Rate limit**: per user/IP per minute and per day (Workers rate-limiting binding or a simple KV/Durable Object counter). Start small, e.g. 10 per minute, 100 per day.
  4. **Input limits**: max prompt length, fixed model, fixed max output tokens. The client never chooses the model or token limit.
  5. **Fail closed**: if anything is off, return an error instead of calling the paid API.
- Put limit numbers in one config object at the top and tell the user where they are: "하루 100번으로 막아 뒀어요. 바꾸고 싶으면 말하세요."
- Deploy: `npx wrangler deploy`; put the Worker URL in the frontend config.

## Firebase Functions (only if chosen)

- Human: upgrade to Blaze in the console (card). Before that, set a budget alert AND explain it does not cap spending.
- Use `defineSecret` for keys; same protections as above (App Check, auth, rate limit, input limits).
