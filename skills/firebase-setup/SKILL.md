---
name: firebase-setup
description: Connect a project to Firebase through the Firebase CLI so the owner only has to (1) have a Firebase account and (2) log the CLI in once; you run everything else (project, web app config, Firestore, login providers, hosting). Use before the first deploy, before adding login or a database, and when the user says "파이어베이스 연결", "Firebase 설정", "파이어베이스 로그인", "firebase login", or a Firebase command fails with an authentication error.
---

# Firebase setup: the owner logs in, you drive the CLI

The owner does two things, once per computer. You do the rest with the Firebase CLI. Never ask the owner to click around the Firebase console for something the CLI can do.

Say it once, in plain words: "파이어베이스는 두 가지만 해 주시면 돼요. 계정 만들기, 그리고 로그인 한 번. 나머지는 제가 명령어로 다 할게요."

## The CLI

- Install it into the project so every session uses the same version: `npm install -D firebase-tools`, then run commands as `npx firebase <command>`. Before a project exists, use `npx firebase-tools@latest <command>`.
- Always pass `--project <id>` and `--non-interactive` (except `login`). A command that waits for a keyboard answer hangs your shell.
- The login is stored for the computer, not the project, so one login serves every project.

## Owner step 1: Firebase account (once ever)

1. Open https://console.firebase.google.com and sign in with the Google account they want to use.
2. If a welcome or terms screen appears, accept it. They don't need to create anything there.

Wait for "했어". (Without accepting the terms, project creation from the CLI fails.)

## Owner step 2: log the CLI in (once per computer)

First check: `npx firebase-tools@latest login:list`. If it shows an account, skip this step and tell them which account is connected.

Otherwise the login asks questions and opens a browser, which your shell can't answer. Ask the owner to run it themselves, giving this exact command in its own code block and telling them where to paste it: the Terminal app (Mac) or PowerShell (Windows), or the app's Terminal panel.

```bash
npx firebase-tools@latest login
```

Tell them what will happen: "질문이 나오면 Enter, 브라우저가 열리면 같은 구글 계정으로 '허용'을 누르고 'Success' 가 보이면 돌아오세요." Then verify with `login:list` yourself.

Never use `login:ci`, tokens, or service-account keys, and never read the CLI's stored credential files. If the wrong account is connected, the owner runs `npx firebase-tools@latest login --reauth` (or `logout` then `login`).

## Everything after this is yours

Do the parts the app needs, in order. Skip a part if `.launchpad/profile.json` shows it is already done.

### 1. Project (if `firebaseProjectId` is null)

- Pick an id: project name + 4 random lowercase letters/digits (lowercase, hyphens, 6-30 chars), e.g. `song-ranking-k7q2`. It becomes the free address `song-ranking-k7q2.web.app`; ask if they like it.
- `npx firebase-tools@latest projects:create <id> --display-name "<name>" --non-interactive`
- Write `.firebaserc` → `{ "projects": { "default": "<id>" } }`, save `firebaseProjectId` in the profile, then `npm install -D firebase-tools`.
- If it fails with a terms error, owner step 1 was skipped or the CLI is logged in as a different account: compare with `login:list`. If the account limit is hit, offer to reuse an old project (`npx firebase projects:list`) instead.

### 2. Web app config (if the app uses login or a database)

- `npx firebase apps:create web "<name>" --project <id> --non-interactive` → note the App ID it prints.
- `npx firebase apps:sdkconfig web <appId> --project <id>` → put the config object into `src/lib/firebase.ts`.
- The web `apiKey` in this config is a public identifier, not a secret, so it is fine in frontend code (see `api-keys` section 4).

### 3. Firestore (if the app stores shared data)

- `npx firebase firestore:databases:create "(default)" --location=asia-northeast3 --project <id> --non-interactive` (Seoul).
- If the API is not enabled yet, wait a minute and retry once.
- Deploy the rules right away (`npx firebase deploy --only firestore --project <id> --non-interactive`) so the database never sits open.
- Fallback only if the CLI keeps failing: ask the owner to create it in the console in **production mode** with location Seoul. Never test mode.

### 4. Login providers (if `loginLevel` ≥ 1)

Add to `firebase.json` and deploy with `npx firebase deploy --only auth --project <id> --non-interactive`:

```json
"auth": {
  "providers": {
    "emailPassword": true,
    "googleSignIn": {
      "oAuthBrandDisplayName": "<app name>",
      "supportEmail": "<the logged-in account from login:list>"
    }
  }
}
```

- Keep only the providers the chosen level needs: level 1 uses `emailPassword`; levels 2-3 use `googleSignIn`.
- `localhost`, `<id>.web.app` and `<id>.firebaseapp.com` are allowed by default. A custom domain must be added to the authorized domains (see `add-domain`).
- If this deploy fails because the CLI is too old, update `firebase-tools`. If it still fails, fall back to a short console guide: Authentication → 시작하기 → 로그인 방법.

### 5. Hosting

`deploy` handles this. If a deploy reports that no Hosting site exists, run `npx firebase hosting:sites:create <id> --project <id> --non-interactive` once and retry.

## Free plan guard

Stay on Spark (free, no card). If any command says it needs the **Blaze** plan, stop, tell the owner in one line which feature asked for it, and offer the free alternative (`add-server`, a static data file, etc.). Never start an upgrade or ask for a card.

## Report

End with a short checklist in Korean, e.g.:

```
파이어베이스 연결 완료
✅ 로그인된 계정: me@gmail.com
✅ 프로젝트: song-ranking-k7q2
✅ 데이터베이스(서울) + 데이터 규칙
✅ 구글 로그인 켜짐
다음: "배포해줘"
```

Remember the moment for the memory list if they want: "파이어베이스 = 내 사이트가 사는 가게. 로그인은 컴퓨터마다 한 번."
