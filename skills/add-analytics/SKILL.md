---
name: add-analytics
description: Visitor statistics with Google Analytics on Firebase (free) - the owner clicks one consent page, Claude does everything else with the CLI and code, then checks it worked. Also the "should we collect stats?" question asked at project start. Use when the profile says analytics is wanted, after the first deploy, and when the user says "방문자 통계", "사용자 통계", "몇 명이 봤어?", "구글 애널리틱스", "GA 붙여줘", "애널리틱스", "조회수", "누가 들어왔는지".
---

# Visitor statistics (Google Analytics via Firebase)

Free on the Spark plan, no card. The Firebase CLI has **no command that turns Google Analytics on**, and the Google Analytics terms must be accepted by a person, so the owner does exactly one console visit. You do everything before and after it. Never use tokens, REST calls or the CLI's stored credentials to get around this, and never click "agree" for the owner.

## 1. 🔸 The question (asked by `start-project`, or when the owner brings it up)

Ask it as one short message: why, then the question, then the easy way out. Example wording:

```
사이트를 공개하면 "몇 명이 들어왔는지" 궁금해지는 순간이 와요.
방문자 통계를 켜 두면 이런 걸 볼 수 있어요:
- 하루에 몇 명이 왔는지, 폰으로 왔는지 컴퓨터로 왔는지
- 어떤 페이지(어떤 게임, 어떤 메뉴)를 제일 많이 봤는지
- 카톡·인스타 중 어디서 링크를 타고 왔는지

방문자 통계를 모을까요?
1. 네, 모아 주세요 — 구글 애널리틱스(무료)를 붙여요. 처음 한 번만 동의 화면에서 버튼 몇 개 눌러 주시면 돼요
2. 아니요, 괜찮아요
3. 이게 왜 필요한지 조금 더 설명해 줄래요?

잘 모르겠으면 그냥 2번 하셔도 돼요. 나중에 "방문자 통계 붙여줘" 하면 언제든 켤 수 있어요.
```

- On 3: two or three plain sentences at the owner's `explainLevel` (e.g. "가게에 손님 수 세는 카운터를 다는 거예요. 어떤 메뉴 앞에 오래 서 있었는지도 알 수 있어요. 손님 이름이나 얼굴은 안 남아요."), then ask 1 or 2 again.
- Never push. If they hesitate, say "안 하셔도 괜찮아요" and move on with 2.
- Save the answer in `.launchpad/profile.json` → `"analytics"`: `"wanted"` (1), `"off"` (2). It becomes `"on"` after step 4 below.
- Type A (나만 쓰는 도구, not deployed): don't ask; set `"off"`.

## 2. When to set it up

It needs the Firebase project, which exists only from the first deploy. So:
- At project start: only ask and record (step 1).
- `deploy` runs this skill right **after the first successful deploy** when `analytics` is `"wanted"`, then redeploys. The owner sees the live site first, then turns on stats.
- If the owner asks later ("방문자 통계 붙여줘"): run it now (run `firebase-setup` first if there is no project yet).

## 3. 🔸 The one console visit: explain first, link last

Prepare first, so the page they open is already the right one:
1. Make sure the project has a web app: `npx firebase apps:list web --project <id> --non-interactive`. If none, `npx firebase apps:create web "<name>" --project <id> --non-interactive`.
2. Check whether stats are already on: `npx firebase apps:sdkconfig web <appId> --project <id>`. If the output already has `measurementId`, skip to step 4.

Then send **one message**: the steps first, the link at the very end. Do not open the browser yourself (`open`/`start`) - the page would cover the steps before they are read. Write it like this (fill in the real project id):

```
구글 애널리틱스를 켜려면 동의 화면을 한 번만 거치면 돼요. 아래 순서를 먼저 읽고, 맨 아래 링크를 눌러 주세요.

1. 링크를 열면 '프로젝트 설정 → 통합'(Integrations) 화면이에요.
   (다른 화면이 뜨면: 왼쪽 위 톱니바퀴 → 프로젝트 설정 → 통합 탭)
2. "Google 애널리틱스" 카드에서 "연결"(Link 또는 Enable) 버튼을 눌러요
3. 계정은 "새 계정 만들기"(Create a new account)를 고르고, 이름은 아무거나 (예: 내 사이트들)
   이미 구글 애널리틱스 계정이 있으면 그걸 골라도 돼요
4. 나라·지역(Analytics location)은 대한민국. 다른 체크 항목은 그대로 둬도 돼요
5. 약관 동의 칸이 나오면 읽어 보고 체크한 뒤, 마지막 "Google 애널리틱스 사용 설정"(Enable Google Analytics)을 눌러요
6. 카드에 "사용 설정됨"(Enabled)이 보이면 이 창으로 돌아와서 "다 했어"라고 말해 주세요

버튼 이름은 조금 다를 수 있어요. 화면이 다르게 보이거나 막히면 캡처해서 붙여 넣어 주세요. 같이 볼게요.

👉 여기를 눌러 여세요: https://console.firebase.google.com/project/<id>/settings/integrations
```

- Show the link as a clickable markdown link as the last line. Nothing after it.
- They must be signed in to the browser with the same Google account the CLI uses (`login:list`); that account created the project, so it is the Owner, which linking needs. If the page says they have no access, a different Google account is signed in.
- Wait for "다 했어". Don't repeat the instructions unless they ask.

## 4. After "다 했어": check, then do the rest yourself

1. **Check**: `npx firebase apps:sdkconfig web <appId> --project <id>` must now show `measurementId` (`G-XXXXXXX`); the field only exists once the app is linked. If not, wait 30 seconds and retry, up to 3 times (linking finishes in the background). Still missing: ask which step they reached (or for a screenshot) and point to the one that was skipped. Don't send the whole guide again.
2. **Config**: put the full config (with `measurementId`) into `src/lib/firebase.ts`. A site without login or a database may not have this file yet: `npm install firebase`, then create it with `export const app = initializeApp(firebaseConfig);`. The web config is a public identifier, not a secret (see `api-keys` section 4).
3. **Analytics module** `src/lib/analytics.ts`:

   ```ts
   import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";
   import { app } from "./firebase";

   // Only the live site counts visits; local runs and unsupported browsers do nothing.
   let analytics: Analytics | null = null;
   if (import.meta.env.PROD) {
     isSupported().then((ok) => { if (ok) analytics = getAnalytics(app); }).catch(() => {});
   }

   export function track(name: string, params?: Record<string, string | number>) {
     if (analytics) logEvent(analytics, name, params);
   }
   ```

   Import it once in `main.tsx` (`import "./lib/analytics";`). Google Analytics counts page loads by itself and, through its "page changes based on browser history events" setting, React Router page changes too, so don't log `page_view` yourself (that would count twice). Check it in step 5: if opening a detail page does not show up in Realtime, ask the owner to look at Analytics → 데이터 스트림 → 웹 → 향상된 측정 → 페이지 조회 고급 설정 and turn the browser-history option on (one more console visit, same steps-first, link-last format).
4. **Events that matter** (2-4, not every click): the app's key actions, e.g. `pick_like` (찜), `share_click`, `restart`, `game_open` with `{ id }`. Names: lowercase snake_case, ≤ 40 characters, no `firebase_`/`google_`/`ga_` prefix. Call `track()` from hooks or event handlers, never from `src/logic/`. Never send names, emails, or anything typed by the visitor.
5. **Notice** (the Google Analytics terms require a privacy notice that says the site uses Google Analytics and cookies):
   - A `/privacy` page in plain Korean: 이 사이트는 방문 통계를 위해 구글 애널리틱스를 써요 / 쿠키(`_ga`)로 같은 방문자인지 구분해요 / 이름·이메일·입력한 글은 보내지 않아요 / 원치 않으면 브라우저에서 쿠키를 막거나 광고 차단을 쓰면 세지 않아요 / a link "구글이 정보를 사용하는 방법" → `https://policies.google.com/technologies/partner-sites` (through `ExternalLink`) / 문의: the owner's contact if they want one.
   - One footer line on every page: "방문 통계(구글 애널리틱스)를 사용해요 · 개인정보 안내" linking to `/privacy`.
   - If the owner expects visitors from Europe, tell them in one line that Europe requires asking before cookies, and offer a small consent banner (`setConsent` from `firebase/analytics`, default denied until "동의"). Not needed by default.
6. **Save**: profile `"analytics": "on"` and `"measurementId"`; `CLAUDE.md` Project section gets "Analytics: Google Analytics (`track()` in `src/lib/analytics.ts`)". Save point, then `deploy`.

## 5. Tell them where to look

```
방문자 통계 켜짐 ✅
- 보는 곳: https://console.firebase.google.com/project/<id>/analytics  (Firebase → Analytics)
- 지금 들어온 사람은 "실시간"에서 몇 분 안에 보여요. 하루 통계는 보통 다음 날(늦으면 이틀) 채워져요.
- 광고 차단을 쓰는 방문자는 안 세어져서, 실제보다 조금 적게 나와요.
- 내 컴퓨터에서 켜 본 건 세지 않아요. 진짜 사이트 방문만 세요.
```

Test it once: they open the live site on their phone and tap into one detail page, then look at the realtime view together (the home page and the detail page should both appear).

I can't read the numbers for them (that would need a login token, which this kit never uses). If they want, they can paste a screenshot of the dashboard and ask "이거 무슨 뜻이야?".

## Turning it off

"통계 꺼줘": remove the `analytics.ts` import and `track()` calls, remove the footer line and `/privacy` page, set `"analytics": "off"`, deploy. The Google Analytics link in the Firebase console can stay; nothing is collected without the code.
