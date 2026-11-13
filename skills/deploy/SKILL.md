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
2. **Firebase CLI**: use `npx firebase-tools@latest` (no global install needed), or `firebase` if already installed.
3. **Login (human step)**: `npx firebase-tools login`. A browser opens; the user signs in with their Google account and approves. Tell them exactly that, and wait.
4. **Project** (first time only; skip if `.launchpad/profile.json` has `firebaseProjectId`):
   - Pick an id: project name + 4 random lowercase chars (globally unique, lowercase, hyphens), e.g. `song-ranking-k7q2`. The id becomes the free address `song-ranking-k7q2.web.app`, so ask if they like it.
   - `npx firebase-tools projects:create <id> --display-name "<name>"`. If it fails (terms not accepted, quota), guide the user to create it in console.firebase.google.com and paste the id.
   - If the app uses Auth/Firestore: `npx firebase-tools apps:create web <name> --project <id>`, then `npx firebase-tools apps:sdkconfig web --project <id>` and put the config into `src/lib/firebase.ts`.
   - Save `firebaseProjectId` to the profile.
5. **Config files** (write them, don't run interactive `firebase init`):
   - `.firebaserc` → `{ "projects": { "default": "<id>" } }`
   - `firebase.json` → start from `${CLAUDE_PLUGIN_ROOT}/templates/firebase.json`; remove the `firestore` block if the app has no database.
   - If the app uses Firestore: copy `${CLAUDE_PLUGIN_ROOT}/templates/firestore.indexes.json`, and `firestore.rules` if the project has none yet.
6. **Tests and build**: `npm test` (if tests exist) then `npm run build`. Fix failures before deploying; explain in one line what was broken.
7. **Save point**: create one via `save-points` ("배포 전").
8. **Deploy**: `npx firebase-tools deploy --project <id>`.
9. **Report**: give the URL `https://<id>.web.app`, save it as `deployedUrl` in the profile, and suggest: "폰으로 열어 보세요. 이제 와이파이가 달라도, 이 컴퓨터를 꺼도 열려요."

## Updates

Same command again after changes. Remind: "고친 뒤 '다시 올려줘' 하면 돼요. 올리기 전까지는 인터넷 사이트는 그대로예요."

## Preview link (optional)

To show friends a draft without touching the real site: `npx firebase-tools hosting:channel:deploy preview --expires 7d`. It gives a temporary URL that expires.

## Problems

| Message | Meaning | Action |
|---|---|---|
| `Failed to authenticate` | 로그인이 풀렸어요 | human: `firebase login --reauth` |
| `HTTP Error: 403` | 이 구글 계정이 그 프로젝트 권한이 없어요 | check account / project id |
| Blank page on web.app | 주소 이동 설정 문제 | ensure SPA rewrite to `/index.html` in firebase.json and `public: "dist"` |
| `requires the Blaze plan` | 유료 플랜이 필요한 기능을 쓰고 있어요 | find which feature; prefer a free alternative (see `add-server`) |
