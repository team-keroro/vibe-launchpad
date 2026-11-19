---
name: example
description: Guided follow-along examples for first-time vibe coders. The owner picks one of two ready-made projects, sees the exact prompt, can change it, and Claude builds it, runs it, deploys it to Firebase and hands back a share link or QR code. Use when the user types /example or /vibe-launchpad:example, or says "예제", "예제 해 볼래", "따라 해 보기", "연습용으로 하나 만들어 보자", "튜토리얼", "샘플 프로젝트", "점심 메뉴 예제", "추억의 게임 예제".
---

# Examples: follow along from prompt to a shared link

The owner is new. The point is to feel the whole loop once: **prompt → app → change by talking → internet → friends open it**. Keep every message short, in Korean, and wait for their answer at each 🔸 step.

## 1. 🔸 Pick an example

Ask with one question (use the question tool if you have one, else a numbered list):

| # | 예제 | 무엇을 배우나 |
|---|---|---|
| 1 | 🍜 오늘 뭐 먹지? — 카드를 밀어서 점심 메뉴 고르기 | 카드 넘기기, 유튜브 쇼츠, 사진 출처, 맛 게이지 |
| 2 | 🕹️ 추억의 게임 박물관 — 90년대·2000년대 게임 추억 사이트 | 자료 모으기(설명·영상·이미지), 상세 페이지 주소, 아스키 아트 테마 |

If they already named one ("점심 예제"), skip the question.

## 2. 🔸 Show the prompt, then ask before running

Show the prompt for the chosen example **in a code block, exactly as below**, then say:

"이 문장 그대로 AI에게 시키면 앱이 만들어져요. 이대로 실행할까요? 바꾸고 싶은 것(음식·게임 종류, 색, 개수)이나 더 넣고 싶은 기능이 있으면 말해 주세요."

Offer 2-3 add-on ideas as one line each, so they see what is possible:
- Example 1: "비 오는 날 추천 버튼", "가격대 표시", "친구랑 같이 고르기(로그인 필요)"
- Example 2: "친구들이 추억 댓글 남기기(로그인 + 데이터베이스)", "게임 맞히기 퀴즈", "내가 해 본 게임 체크"

If they change something, rewrite the prompt with the change, show it again in full, and ask again. Run only after a clear yes ("응", "실행", "좋아"). An add-on that needs login or a database changes the project type: say so in one line (e.g. "댓글은 로그인이 필요해서 파이어베이스 설정이 조금 더 들어가요").

### Example 1 prompt

```
새 프로젝트 시작하자.
"오늘 뭐 먹지?" 점심 메뉴 고르는 한 페이지 사이트를 만들고 싶어.
- 음식 10개로 시작하고, 나중에 쉽게 늘릴 수 있게 해 줘.
- 카드 한 장에 음식 하나씩. 오른쪽으로 밀면 찜, 왼쪽으로 밀면 패스.
- 카드에는 그 음식 유튜브 쇼츠를 소리 끄고 자동재생으로 먼저 보여 줘. 그 아래 예쁜 사진 6장(제일 예쁜 게 메인, 나머지는 눌러서 보기). 사진은 출처 표시가 되는 무료 사진만 써.
- 단맛·짠맛·신맛·매운맛·감칠맛을 0~5 게이지로 보여 줘.
- 찜한 건 옆에 목록으로 모이고, 누르면 그 메뉴 화면이 열려.
- 다 넘기면 찜한 것 중 하나를 "오늘은 이거!"로 골라 줘. 다시 시작 버튼도.
누구나 보는 공개 사이트, 로그인 없음, 분위기는 따뜻한 카페 느낌, 설명은 중학생 수준으로.
```

Build guide: `start-project` recipe `recipes/lunch-picker.md` for data, image licensing and the build-time-AI lesson. Where the recipe and this prompt differ (swipe cards instead of sliders, 5 tastes 0-5), **the prompt wins**.

### Example 2 prompt

```
새 프로젝트 시작하자.
90년대·2000년대 "추억의 게임 박물관" 사이트를 만들고 싶어.
- 그 시절 한국에서 많이 한 게임 12개로 시작하고, 나중에 쉽게 늘릴 수 있게 해 줘.
- 게임마다 자료를 모아 줘: 나온 해, 기종(PC·오락실·게임기), 장르, 만든 회사, 한 줄 소개, "그때 그 시절" 추억 한 줄.
- 게임마다 플레이 영상이나 예고편 유튜브를 넣고, 화면 이미지는 출처 표시가 되는 무료 이미지만 써. 쓸 수 있는 이미지가 없으면 그 장면을 아스키 아트로 그려 줘.
- 첫 화면은 연도별 타임라인과 게임 카드 목록. 90년대 / 2000년대, 기종으로 거를 수 있게.
- 카드를 누르면 그 게임 상세 페이지가 열리고, 주소만 보내도 그 게임이 바로 열리게.
- 디자인은 아스키 아트 터미널 테마: 어두운 남색 배경, 하늘색·분홍 네온, 픽셀 한글 글꼴, 박스 선으로 그린 창, 깜빡이는 커서, 아스키 아트 큰 제목.
누구나 보는 공개 사이트, 로그인 없음, 설명은 중학생 수준으로.
```

Build guide: `start-project` recipe `recipes/retro-games.md` (data, media rules, ASCII theme tokens).

## 3. Build

1. Run `start-project` with the prompt as the interview answers. Do **not** re-ask what the prompt already says (who uses it, login, data, mood, explain level). The visitor statistics question is not in the prompt, so it is still asked (with its "잘 모르겠으면 안 하셔도 돼요"). Folder name: `lunch-picker` or `retro-games` (step 0 of `start-project` handles an occupied folder).
2. Follow the recipe. Narrate in one short line per milestone ("데이터 모으는 중", "카드 화면 만드는 중", "테스트 통과") so the owner sees the steps, not a wall of code.
3. Run it with `run-local` and give the local link. Then say: "화면 보면서 바꾸고 싶은 거 말해 보세요. 예: '카드 색 더 밝게', '게임 2개 더 넣어 줘'." Handle changes through `task-queue` as usual.

## 4. 🔸 Ask before putting it online

When they are happy (or say "다 됐어"), ask:

"친구들도 볼 수 있게 인터넷에 올릴까요? 무료 주소(`이름.web.app`)가 생겨요. 처음이면 파이어베이스 계정 만들기와 로그인 한 번만 해 주시면 돼요."

On yes: `deploy` (which runs `firebase-setup` when needed). On no: tell them they can say "배포해줘" any time.

## 5. 🔸 Share

After a successful deploy, run the `share` skill: ask link / QR code / share card / link preview, make what they pick, and hand it over.

## 6. Wrap

Finish with 3 short lines:
- 지금 한 것: 프롬프트 → 앱 → 수정 → 배포 → 공유.
- 다음에 해 볼 것: "다른 예제도 해 볼래" or "내 아이디어로 새 프로젝트 시작하자".
- Offer the memory list once: "오늘 배운 거 '기억해 둬'라고 하면 정리해 드려요."
