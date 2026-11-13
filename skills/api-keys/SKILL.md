---
name: api-keys
description: Cost guard for paid API keys (OpenAI, Anthropic/Claude, Google Gemini/Cloud, Stripe, etc.). Use BEFORE any paid key is created or added, when the user mentions an API key, billing, cost, or a possible leak ("API 키", "키 넣어줘", "OpenAI 연결", "Gemini 키", "요금", "비용", "돈 나가?", "키가 노출됐어", "키 유출", "청구서").
---

# API keys = credit cards

A leaked key lets strangers spend the user's money. Bills of hundreds or thousands of dollars overnight are possible. This skill always runs **before** a paid key goes into a project.

## 1. Ask first: is a key really needed?

Can the AI result be made in advance at build time (by you, now)? If yes, do that instead. No key, no cost. See `add-server` step 1.

## 2. Limits before keys (mandatory)

Ask: "이 프로젝트에 한 달 최대 얼마까지 쓸 수 있어요?" (suggest a small number like $5-10 for a hobby project). Then walk the user through setting it, step by step, waiting for "했어" each time. Console menu names change; describe where to look and ask for a screenshot if they can't find it.

| Provider | Hard stop available? | What to set |
|---|---|---|
| OpenAI | Project-level budget / usage limits; prepaid credits | Create a **separate project** for this app, set its monthly budget, and use prepaid credits with auto-recharge OFF so spending physically stops when credits run out |
| Anthropic (Claude) | Workspace spend limits; prepaid credits | Separate **workspace** for this app with a monthly spend limit; auto-reload OFF |
| Google AI Studio / Gemini | Free tier has rate limits; paid tier bills the Cloud account | Prefer the free tier for hobby apps; if billing is on, see Google Cloud below |
| Google Cloud / Firebase Blaze | **Budgets only send alerts; they do not stop spending** | Set a budget with alerts at 50/90/100%; restrict API keys; set per-API quotas lower where possible |
| Stripe | n/a (secret key moves money) | never in frontend; restricted keys only |

Say clearly: **"알림은 메일만 보내고 멈추지 않아요. 멈추는 장치는 '한도'와 '선불 크레딧'이에요."**

Record the limit in `.launchpad/profile.json` → `paidKeys`: `[{ "provider": "openai", "monthlyLimitUsd": 10, "limitSetOn": "YYYY-MM-DD", "where": "server/.dev.vars + Worker secret" }]`. The `safety-check` skill refuses to pass if a paid key exists without a recorded limit. Write only these objects, never plain-text notes; if `paidKeys` holds a plain string from an older project, replace it with this record, or remove it if the key is not used.

## 3. Where keys may live

- OK: Worker/Functions secrets; local `.env` / `server/.dev.vars` files that are gitignored.
- Never: frontend code; any `VITE_`-prefixed variable (Vite puts it in the browser bundle); Git history; chat messages; screenshots; the memory list.
- One key per project, named after the project, so a leak can be shut off without breaking other apps.
- Do not ask the user to paste a secret key into the chat. Tell them to paste it into the file or the `wrangler secret put` prompt themselves.

## 4. Firebase web config is different

The Firebase web `apiKey` in `firebaseConfig` is a public identifier, not a secret; it is OK in frontend code. Still, in Google Cloud console → APIs & Services → Credentials, restrict that key to the app's domains (HTTP referrers) and to the Firebase APIs it needs. Security comes from Auth + rules (+ App Check optionally).

## 5. If a key leaked

Act immediately, calmly:
1. Human: revoke/delete the key in the provider console **now** (deleting it from the code is not enough; Git history and copies remain).
2. Human: create a new key; you put it in the right secret place.
3. Check the provider's usage page for unexpected spending; if there is any, contact provider support.
4. You: find how it leaked (frontend bundle, committed .env, public repo) and fix the cause. If it was committed, explain that history still contains it, which is why revoking is the real fix.
5. Add a line to the memory list via `remember`.
