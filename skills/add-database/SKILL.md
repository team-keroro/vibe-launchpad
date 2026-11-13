---
name: add-database
description: Store data (votes, posts, lists, user settings) in Firestore with safe security rules. Use when the app needs to save or share data ("저장되게 해줘", "데이터 저장", "투표 결과 모으기", "다른 사람도 보게", "새로고침해도 남게", "DB").
---

# Database (Firestore)

## First: does it need a database?

- Data that never changes and is the same for everyone (menu list, song list you wrote yourself) → a static file in `src/data/`. Free, no rules, no risk. Prefer this.
- Data only for this one browser (settings, draft) → `localStorage`.
- Data created by users or shared between people → Firestore.

Explain the choice in one sentence.

## Setup

1. Human step (once): Firebase console → Build → Firestore Database → 데이터베이스 만들기 → **프로덕션 모드** → location `asia-northeast3 (Seoul)`. Never choose "테스트 모드" (it opens everything to everyone for 30 days).
   - If the Firebase CLI version supports it you may try `firebase firestore:databases:create "(default)" --location=asia-northeast3`; fall back to the console if it fails.
2. Start from `${CLAUDE_PLUGIN_ROOT}/templates/firestore.rules` and adapt to the data model. Default is deny-all.
3. Data access lives in hooks (`src/hooks/useXxx.ts`); calculations live in `src/logic/` with tests. Components never call Firestore directly.

## Rule patterns (pick and combine)

- **Owner only**: `allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerUid;` (for create: `request.resource.data.ownerUid`)
- **Public read, owner write**: `allow read: if true; allow write: if <owner check>;`
- **Write own doc only** (votes): path `.../votes/{uid}` with `allow write: if request.auth.uid == uid;`
- **Members only**: see `add-login` level 3 `isMember()`.
- Validate shape and size: `request.resource.data.keys().hasOnly([...])`, string `.size() < 500`.

Never ship `allow read, write: if true;` or a `request.time < timestamp.date(...)` test-mode rule. The guard hook blocks deploys with these.

## Free plan limits (Spark)

Free daily quotas are generous for friends-scale apps (tens of thousands of reads per day). Avoid patterns that read whole collections on every screen; read once, cache in the hook. Check current numbers on the Firebase pricing page if the user expects many visitors.

## Deploy rules

Rules are deployed together with `firebase deploy` (or `firebase deploy --only firestore:rules`). Tell the user: "데이터 규칙도 같이 올라갔어요."
