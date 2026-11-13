# Recipe: lunch picker (오늘 뭐 먹지? 맛 점수 추천)

Pick what you crave today. Each dish has taste scores (단맛, 짠맛, 매운맛, 든든함, 기름짐, 따뜻함 0-10) shown as a radar chart. The user moves sliders for today's craving and gets the closest dishes.

## Pre-filled interview

- Type: C (public, no login, no shared data)
- Login: level 0
- Data: static file only
- Paid keys: none
- Mood: suggest `warm-cafe` or `playful`

## Key lesson: AI at build time, not in the app

YOU (the coding agent) generate the dish list and scores now, while building, and save them to `src/data/dishes.json`. The app itself has no AI key, no server, no cost. Tell the user this in one or two sentences — it is the safest pattern.

If the user later wants "live AI recommendations", that turns the project into type E: go through `api-keys` (limits first) and `add-server`. Do not put an AI key in frontend code.

## Data (`src/data/dishes.json`)

```json
[
  {
    "id": "kimchi-jjigae",
    "name": "김치찌개",
    "category": "한식",
    "meal": ["lunch", "dinner"],
    "scores": { "sweet": 2, "salty": 7, "spicy": 7, "hearty": 8, "greasy": 4, "warm": 10 },
    "image": "/images/kimchi-jjigae.jpg",
    "imageCredit": "Photo by ... on Unsplash"
  }
]
```

Start with ~30 dishes across 한식, 중식, 일식, 양식, 분식, 아시안.

## Images: licensing matters

Do not scrape random images from the web (copyright). Options, in order:
1. Free-license photos (e.g. Unsplash) — download, store in `public/images/`, keep the credit line
2. Emoji or simple illustrations
3. AI-generated images the user makes themselves

Explain this in one sentence when choosing.

## Logic (`src/logic/`, each with tests)

- `distance(craving, dishScores) → number` (weighted Euclidean)
- `recommend(dishes, craving, { meal, exclude }) → top 5`
- `describeTaste(scores) → "짭조름하고 든든한"` (plain words from the top 2 scores)

Tests: identical scores → distance 0, recommend respects meal filter and exclude list, ordering is stable.

## Hooks

- `useCraving()` — slider state, reset, "랜덤으로 골라줘"
- `useRecommendations(craving)` — calls `recommend`

## Screens

1. Sliders for today's craving + meal toggle (점심/저녁)
2. Top 5 cards with image, name, plain-word description
3. Card detail with a radar chart (use a chart component from the chosen design package or recharts)
