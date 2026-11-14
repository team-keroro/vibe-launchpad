---
name: design
description: Make the site look distinctive instead of the generic AI look, using a mood preset and component packages (shadcn/ui, Cult UI, Magic UI, Aceternity UI). Use when choosing or changing the look ("예쁘게 해줘", "디자인 바꿔줘", "분위기", "이 사이트처럼", "AI가 만든 티 안 나게", "색 바꿔줘", "폰트 바꿔줘", "간격", "여백", "답답해 보여", "빽빽해", "다듬어줘") and during start-project.
---

# Design

Prompting "make a website" alone produces the same average look everywhere (purple gradients, identical rounded cards). Two fixes: **good parts** (component packages) and **a concrete direction** (mood, colors, fonts, references).

## 1. Pick a mood

Offer this list (user picks one, or describes their own, or shares a screenshot):

| Mood | Feel | Colors | Fonts (Google Fonts, Korean-ready) | Packages to lean on |
|---|---|---|---|---|
| `dark-studio` | 음악 작업실, 밤, 네온 | near-black bg, one neon accent | Pretendard / Space Grotesk | Magic UI, Aceternity (glow, spotlight) |
| `warm-cafe` | 따뜻하고 편안한 | cream bg, brown, soft orange | Gowun Dodum / Noto Serif KR | Cult UI (cards, texture) |
| `clean-minimal` | 깔끔하고 차분한 | white, gray, one blue accent | Pretendard / Inter | shadcn/ui base only |
| `retro-pop` | 레트로, 굵고 쨍한 | bold primaries, thick borders | Black Han Sans / Do Hyeon | Cult UI, Magic UI |
| `playful` | 귀엽고 통통 튀는 | pastel, rounded | Jua / Gaegu | Magic UI (confetti, animations) |

Save the choice to `.launchpad/profile.json` → `mood`.

## 2. Apply the base

- Set theme colors as CSS variables in the shadcn theme (`src/index.css`), not hard-coded per component.
- Load the fonts (Google Fonts link or `@fontsource` package). Pretendard: use its official CDN or npm package.
- Write the chosen colors/fonts/mood into the project's `AGENTS.md` "Design" section so every later change keeps the same look.

## 3. Add components from packages

All four are built on shadcn/ui and install with the shadcn CLI. Commands change over time: **open the component's page on the package site and copy its exact install command** (use web fetch if available). Typical forms:

- shadcn/ui: `npx shadcn@latest add button card dialog`
- Cult UI (cult-ui.com): `npx shadcn@latest add https://cult-ui.com/r/<component>.json`
- Magic UI (magicui.design): `npx shadcn@latest add "https://magicui.design/r/<component>"`
- Aceternity UI (ui.aceternity.com): `npx shadcn@latest add https://ui.aceternity.com/registry/<component>.json`

Rules:
- Use free components only. If a component is marked Pro/paid, pick a free alternative and say so.
- Use at most 2 packages per project, so the style stays consistent.
- Components go in `src/components/`; they must not contain business logic (see `logic-and-tests`).

## 4. Spacing rhythm (where text is heavy)

Cramped text is the fastest way to look unfinished. But spacing everything out evenly looks loose and empty. The rule: **more space between groups than inside a group, and more space only where text is heavy.**

Text-heavy groups get room (Tailwind steps, 1 step = 4px):

| Where | Inside the group | Between this group and the next |
|---|---|---|
| Title block: name + category badge + subtitle/description | title ↔ subtitle `gap-2` (8px), description `leading-relaxed` | `space-y-5`–`6` (20–24px) before the next group |
| Label rows: ratings, taste/score gauges, key–value lists | row gap `gap-3` (12px), label ↔ bar/value `gap-3` | `mt-5`–`6` before and after the list |
| Helper or hint text between components (e.g. "오른쪽으로 밀면 찜, 왼쪽은 패스") | — | `my-5` (20px) above and below, `leading-relaxed`; it separates two areas, so it never touches either |
| Section headings (e.g. "찜한 메뉴") | heading ↔ first item `mb-4` | list items `gap-3` |
| Text area inside a card | padding `p-5`–`6` (20–24px) | — |

Keep these tight (do NOT add space here):
- Image or video areas, thumbnail strips, icon + label buttons, badges, chips, toolbars: `gap-1`–`2` (4–8px).
- Inside one line (icon next to text, number next to bar).

Checks:
- Use at most 3–4 different gaps on one screen, all from the 4px scale.
- Take a screenshot before and after. If two text groups blur together, add space *between* them, not inside them.
- Write the chosen gaps into the project's `AGENTS.md` "Design" section so later changes keep the rhythm.

## 5. Toast messages (default for every project)

Success and error messages are shown as toasts with **Sonner** (shadcn/ui's toast component), never with `alert()` or ad-hoc banners.

- Install: `npx shadcn@latest add sonner` (creates `src/components/ui/sonner.tsx`).
- Copy `${CLAUDE_PLUGIN_ROOT}/templates/notify.ts` to `src/lib/notify.ts`.
- Mount exactly one `<Toaster {...TOASTER_DEFAULTS} />` at the app root (`App.tsx`), imported from `@/components/ui/sonner`.
- Defaults: **bottom-center**, **auto-dismiss after 5 seconds**, close button shown.
- If a message must stay until the user closes it (the owner asks for it, or it is something the user must act on), use `{ persistent: true }`: `notify.error('저장에 실패했어요. 다시 시도해 주세요.', { persistent: true })`.
- Always call `notify.success / error / info / warning` from `src/lib/notify.ts`, not `toast` directly, so the defaults stay in one place. Call it from hooks or event handlers, not from `src/logic/` (logic stays pure).
- Messages are short, plain Korean, and say what happened plus what to do next if it failed.

## 6. "이 사이트처럼 해 줘"

If the user shares a screenshot or URL: describe what you see in 3-5 traits (layout, color, type, spacing, motion), confirm with the user, then apply. Do not copy logos, brand names, text or images from the reference.

## 7. Before/after

When the user asks why this matters, show it: keep a screenshot of the plain version, then the styled one, side by side.
