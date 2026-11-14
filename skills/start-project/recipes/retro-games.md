# Recipe: retro games museum (추억의 게임 박물관)

A nostalgia site for games people in Korea played in the 1990s and 2000s. Each game has facts, a "그때 그 시절" memory line, a YouTube video and images (or ASCII art), on a deep-linked detail page. The whole site uses an ASCII-art terminal theme.

## Pre-filled interview

- Type: C (public, no login, no shared data)
- Login: level 0
- Data: static file only
- Paid keys: none
- Mood: `ascii-terminal` (see the theme section below and the `design` skill)

Add-on "친구들이 추억 댓글 남기기" turns it into type D: login level 2 (Google) via `add-login`, comments in Firestore via `add-database` (owner-only edit/delete rules).

## Key lesson: research at build time

YOU collect the facts, videos and images now, while building, and save them to `src/data/games.json`. The app has no AI, no server, no key. Tell the owner this in one sentence.

## Games to start with (pick 12, mix platforms and decades)

PC: 스타크래프트, 디아블로 2, 바람의 나라, 리니지, 포트리스 2, 크레이지 아케이드, 카트라이더, 메이플스토리, 심즈, 롤러코스터 타이쿤, 창세기전, 프린세스 메이커 2
Arcade (오락실): 철권 3, 킹 오브 파이터즈, 스트리트 파이터 2, 펌프 잇 업, 메탈 슬러그, 테트리스
Console / handheld: 슈퍼 마리오 64, 포켓몬 골드·실버, 젤다의 전설 시간의 오카리나, 파이널 판타지 7

Check facts (year, platform, company) against a reliable source such as the Korean or English Wikipedia article. If unsure, leave the field out rather than guess.

## Data (`src/data/games.json`)

```json
[
  {
    "id": "starcraft",
    "title": "스타크래프트",
    "year": 1998,
    "platforms": ["PC"],
    "genre": "실시간 전략",
    "company": "Blizzard Entertainment",
    "oneLine": "테란·저그·프로토스 세 종족이 싸우는 전략 게임",
    "memory": "PC방에서 친구들과 4:4 팀플, 'GG' 치고 집에 가던 날",
    "tags": ["PC방", "e스포츠"],
    "youtube": [{ "id": "xxxxxxxxxxx", "title": "공식 예고편", "channel": "..." }],
    "images": [
      { "src": "/images/starcraft-1.png", "alt": "...", "credit": "...", "license": "CC BY-SA 4.0", "sourceUrl": "https://commons.wikimedia.org/..." }
    ],
    "ascii": null
  }
]
```

- `memory` is a short line you write in plain Korean that evokes the era (PC방, 오락실 동전, 팩 게임기). It is your own writing, not a quote.
- `ascii`: an ASCII-art scene (max 60 columns × 16 rows) used when `images` is empty. Draw it yourself; do not trace a copyrighted image pixel by pixel.

## Media: copyright matters

Game screenshots, box art and logos belong to the publishers. Rules, in order:

1. **Videos: embed, never download.** Use YouTube embeds (`https://www.youtube-nocookie.com/embed/<id>`). Prefer official channels (publisher trailers) or well-known gameplay channels. Before saving an id, check it exists and allows embedding: `curl -s -o /dev/null -w "%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json"` must print `200`. Drop ids that fail.
2. **Images: free-license only.** Wikimedia Commons files with a free license (CC BY, CC BY-SA, public domain), downloaded into `public/images/` with `credit`, `license` and `sourceUrl` shown under the image. Skip files marked "non-free" or "fair use" (common for game screenshots on Wikipedia) and skip images from random sites.
3. **Otherwise: ASCII art** that you draw (fits the theme).

Explain this in one sentence when collecting.

## Logic (`src/logic/`, each with tests)

- `filterGames(games, { decade, platform, query }) → games` (decade `"1990s"` | `"2000s"` | `"all"`; query matches title and tags)
- `groupByYear(games) → [{ year, games }]` sorted ascending, for the timeline
- `decadeOf(year) → "1990s" | "2000s"`
- `findGame(games, id) → game | undefined`
- `toAsciiBanner(text) → string[]` — a block-letter banner for the Latin title (a small built-in `#` font; Korean text stays in the pixel font)

Tests: filter combinations, empty result, timeline order is stable, unknown id returns undefined, banner rows all have equal width.

## Hooks

- `useGameFilters()` — decade, platform, query, kept in the URL query (`?decade=1990s&platform=PC`) so a filtered view can be shared
- `useGame(id)` — looks up the game for the detail page

## Screens and routes

1. `/` — ASCII banner title, a short "boot" line (`$ ./museum --era 1990-2009`), timeline strip by year, filter chips (90년대 / 2000년대 / 기종), game cards in a grid.
2. `/games/:id` — detail page (deep link): title, facts in a box-drawn panel, memory line with a blinking cursor, YouTube embed, images with credits (or the ASCII scene), "◀ 목록으로", previous/next game.
3. Unknown id → a friendly "404 — 그런 게임 카트리지는 없어요" page with a link home.

## Theme: `ascii-terminal`

Tokens (put them in the shadcn theme in `src/index.css`):

| Token | Value |
|---|---|
| background | `#0b0d17` (dark navy) |
| panel | `rgba(9, 11, 20, 0.92)` |
| text | `#e6ebff` |
| dim / dimmer | `#6b7290` / `#3b4160` |
| accent 1 (cyan) | `#3fd8ff` |
| accent 2 (magenta) | `#ff4fd8` |
| border lines | `#4a5378` |

Fonts: Latin and numbers in **JetBrains Mono** (`@fontsource/jetbrains-mono`), Korean in **Galmuri11** pixel font (`galmuri` npm package, SIL OFL). Body size ≥ 15px; Galmuri is small, so give Korean text `leading-relaxed`.

Look:
- Windows drawn with box characters (`┌─┐ │ └─┘`) in the border color, title in cyan inside the top line: `┌─[ 스타크래프트 ]────┐`. Use a CSS-drawn border with the characters as decoration if a pure-text frame does not fit mobile widths.
- Prompt-style labels: `$ cat games/starcraft.txt`, `> ` before subtitles, `[OK]` in cyan for facts.
- Big title as an ASCII block banner (from `toAsciiBanner`), with a soft glow (`text-shadow: 0 0 14px rgba(140,150,255,0.35)`).
- Faint scanlines over the page (`repeating-linear-gradient` 1px line every 3px, opacity ~0.3) and a dark vignette at the edges.
- A blinking block cursor after the memory line; a typing reveal for the title on first load only.
- Hover: border turns cyan, title turns white. Active filter chip: magenta text and border.
- Respect "reduce motion": no typing, no blinking (the `design` skill's reduced-motion block).
- Mobile first: cards one column under 640px, ASCII art scrolls horizontally inside its box instead of breaking the page.
