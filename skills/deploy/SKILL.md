---
name: deploy
description: Put the app on the internet for free with Firebase Hosting (free web.app address, automatic HTTPS), after a safety check. Use when the user wants to publish/share/upload the site ("배포해줘", "인터넷에 올려줘", "친구한테 링크 보내고 싶어", "다른 사람도 보게", "업데이트 반영해줘", "다시 올려줘").
---

# Deploy (Firebase Hosting, Spark free plan)

Explain once, in one line: "배포는 포장한 사이트를 24시간 열려 있는 상가(Firebase)에 진열하는 거예요. 주소는 무료로 `이름.web.app` 이 생겨요."

## Spark (free) plan: what works, what doesn't

Works free, no credit card: Hosting (`*.web.app`, `*.firebaseapp.com`, custom domain connection, HTTPS), Authentication (email, Google), Firestore (daily free quota).
Needs Blaze (pay-as-you-go, credit card): Cloud Functions, App Hosting (Next.js server), and possibly Cloud Storage for new projects. This kit avoids them by default. If the user needs a server, use `add-server`.

## Steps

1. **Safety check first**: run the `safety-check` skill. Stop if anything is red.
2. **Firebase connected?** If `npx firebase-tools@latest login:list` shows no account or `firebaseProjectId` is null, run the `firebase-setup` skill first. The owner's only steps are there: a Firebase account and one CLI login. You do everything else with the CLI.
3. **Config files** (write them, don't run interactive `firebase init`):
   - `.firebaserc` → `{ "projects": { "default": "<id>" } }` (firebase-setup writes it)
   - `firebase.json` → start from `${CLAUDE_PLUGIN_ROOT}/templates/firebase.json`; remove the `firestore` block if the app has no database; keep any `auth` block firebase-setup added.
   - If the app uses Firestore: copy `${CLAUDE_PLUGIN_ROOT}/templates/firestore.indexes.json`, and `firestore.rules` if the project has none yet.
4. **Tests and build**: `npm test` (if tests exist) then `npm run build`. Fix failures before deploying; explain in one line what was broken.
5. **Save point**: create one via `save-points` ("배포 전").
6. **Deploy**: `npx firebase deploy --project <id> --non-interactive`.
7. **Report**: give the URL `https://<id>.web.app`, save it as `deployedUrl` in the profile, and suggest: "폰으로 열어 보세요. 이제 와이파이가 달라도, 이 컴퓨터를 꺼도 열려요."

## Updates

Same command again after changes. Remind: "고친 뒤 '다시 올려줘' 하면 돼요. 올리기 전까지는 인터넷 사이트는 그대로예요."

## Preview link (optional)

To show friends a draft without touching the real site: `npx firebase hosting:channel:deploy preview --expires 7d --project <id> --non-interactive`. It gives a temporary URL that expires.

## Problems

| Message | Meaning | Action |
|---|---|---|
| `Failed to authenticate` / `not logged in` | 로그인이 풀렸어요 | owner runs `npx firebase-tools@latest login --reauth` in their terminal (see `firebase-setup`) |
| `HTTP Error: 403` | 이 구글 계정이 그 프로젝트 권한이 없어요 | compare `login:list` with the project; owner re-logs in with the right account |
| Hosting site not found | 진열대가 아직 없어요 | `npx firebase hosting:sites:create <id> --project <id> --non-interactive`, then deploy again |
| Blank page on web.app | 주소 이동 설정 문제 | ensure SPA rewrite to `/index.html` in firebase.json and `public: "dist"` |
| `requires the Blaze plan` | 유료 플랜이 필요한 기능을 쓰고 있어요 | find which feature; prefer a free alternative (see `add-server`) |
