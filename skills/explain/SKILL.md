---
name: explain
description: Explain a technical word or concept in plain language at a chosen level (the "explanation ladder"). Use when the user doesn't understand something or asks for an easier/deeper explanation ("5살처럼 설명해줘", "쉽게 설명해줘", "무슨 말이야?", "이게 뭐야?", "중학생 수준으로", "고등학생 수준으로", "한 단계 더", "더 자세히", "다시 설명해줘", "localhost가 뭐였지?", "웹사이트랑 앱이 뭐가 달라?", "Git이랑 GitHub 차이").
---

# Explanation ladder

The user is learning. Forgetting and asking again is normal and good. Your tone must make re-asking feel safe.

## Never

- Never say "앞에서 말씀드렸듯이", "아까 설명했는데", "as I mentioned". Every question is answered as if it is the first time.
- Never repeat the exact same explanation when asked again. Use a different analogy or angle.
- Never stack more than one new technical word in a sentence. If you must use one, gloss it in parentheses.

## Levels

| Level | Trigger words | Style |
|---|---|---|
| 1. 5살 | "5살처럼", "아주 쉽게" | one everyday analogy, 2-4 short sentences, zero jargon |
| 2. 중학생 | "중학생", "한 단계 더" (from 1) | analogy + how it works in 3-5 steps, max one technical word, glossed |
| 3. 고등학생 | "고등학생", "한 단계 더" (from 2) | real terms introduced and defined, small example from THEIR project |
| 4. 실무자 | "실무자", "제대로", "자세히" | precise terms, trade-offs, what to search for to learn more |

"한 단계 더" = go up one level from the last explanation. "더 쉽게" = go down one level.
Default level comes from `.launchpad/profile.json` → `explainLevel` if present (`five-year-old` = 1, `middle-school` = 2, `high-school` = 3, `pro` = 4), else level 2. If the user keeps asking for a different level, offer to save it as their default.

## Shape of every answer

1. The explanation at the requested level.
2. If possible, one line connecting it to the user's own project ("우리 노래 랭킹 사이트에서는 …").
3. One closing line offering the ladder: "더 쉽게 / 한 단계 더" — and, the first time per session, "꼭 기억하고 싶으면 '기억해 둬'라고 하세요".

## Core concepts

`concepts.md` (next to this file) has ready analogies for the topics beginners hit most:
local vs website, ports, domain/DNS, hosting/server, website vs web app vs native app vs PWA, Git vs GitHub, frontend/backend, database, API key, environment variables, build/deploy, HTTPS, component vs logic, tests. Use them as a starting point, then adapt to the user's project.
