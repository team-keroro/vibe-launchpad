---
name: safety-check
description: Check the project for leaked secrets, open database rules, missing cost limits and failing tests before deploying or pushing to GitHub. Use when the user asks for a safety/security check, before every deploy or GitHub push, and when unsure if something is safe ("안전 점검해줘", "보안 확인", "괜찮은지 봐줘", "올려도 돼?", "키 새는 거 없어?").
---

# Safety check

Run every item; report as a short traffic-light list in plain Korean. Red = must fix before deploy/push. Fix what you can yourself, then re-run.

## Checklist

1. **Secrets in code** (red): search `src/`, `public/`, `index.html`, config files and, after a build, `dist/` for secret key patterns: `sk-`, `sk-ant-`, `sk-proj-`, `sk_live_`, `rk_live_`, `ghp_`, `github_pat_`, `xox`, `AKIA`, `-----BEGIN PRIVATE KEY`. Firebase web config `apiKey` (starts with `AIza`) inside `firebaseConfig` is fine; an `AIza` key used for Gemini or Maps calls from the browser is red.
2. **VITE_ secrets** (red): any `VITE_*` variable whose name contains KEY/SECRET/TOKEN and is not the Firebase web config → it is public. Move it to a server.
3. **.env in Git** (red): `.env*` (except `.env.example`) and `.dev.vars` must be in `.gitignore` and not tracked (`git ls-files`). If tracked: untrack, and if it ever held a real key, treat it as leaked (see `api-keys`).
4. **Database rules** (red): `firestore.rules` must not contain `allow read, write: if true` on broad paths or a test-mode `request.time < timestamp.date(...)` rule. Every collection the app uses has a rule matching the intended access (owner/public/members).
5. **Login level matches the rules** (red for type B): internal tools enforce the allowlist in rules, not just in the UI.
6. **Paid keys have limits** (red): every entry in `profile.json` → `paidKeys` is an object with `monthlyLimitUsd` and `limitSetOn`. A plain-text entry (e.g. `"anthropic (optional)"` from an older project) is not a key that was set up: ask the owner whether the key is used; if not, remove the entry; if it is, run `api-keys`. If the code calls a paid API but `paidKeys` is empty, run `api-keys` first.
7. **Server protections** (red if a server exists): origin check, rate limit, input limits, fixed model/max tokens (see `add-server`).
8. **Tests** (red): `npm test` passes, if tests exist.
9. **Build** (red): `npm run build` passes.
10. **Images and content** (yellow): images have a license source/credit (no scraped images); no personal data of others in the repo.
11. **GitHub** (yellow, if a remote exists): repo is private unless the user explicitly wants it public.

## Report format

```
안전 점검 결과
🟢 비밀 키 노출 없음
🟢 데이터 규칙: 투표는 본인만 쓰기, 결과는 주인만 보기
🔴 OpenAI 키 월 한도 기록이 없어요 → 한도부터 걸어요 (api-keys)
🟡 이미지 2장 출처 표시가 없어요
```

End with one line: what will happen next (fix now / ready to deploy).
