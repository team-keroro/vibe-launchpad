---
name: design
description: Make the site look distinctive instead of the generic AI look, using a mood preset and component packages (shadcn/ui, Cult UI, Magic UI, Aceternity UI). Use when choosing or changing the look ("예쁘게 해줘", "디자인 바꿔줘", "분위기", "이 사이트처럼", "AI가 만든 티 안 나게", "색 바꿔줘", "폰트 바꿔줘", "간격", "여백", "답답해 보여", "빽빽해", "다듬어줘", "완성도", "polished", "글자 크기", "로딩", "마감", "커서", "마우스 모양", "손가락 모양") and during start-project.
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
| `ascii-terminal` | 아스키 아트, 옛날 컴퓨터 화면 | dark navy `#0b0d17`, cyan `#3fd8ff` + magenta `#ff4fd8` neon | Galmuri11 (pixel Korean) / JetBrains Mono | shadcn/ui base only; box-drawn frames, scanlines, blinking cursor (details: `start-project/recipes/retro-games.md`) |

Save the choice to `.launchpad/profile.json` → `mood`.

## 2. Apply the base

- Set theme colors as CSS variables in the shadcn theme (`src/index.css`), not hard-coded per component.
- Load the fonts (Google Fonts link or `@fontsource` package). Pretendard: use its official CDN or npm package.
- Write the chosen colors/fonts/mood into the project's `CLAUDE.md` "Design" section so every later change keeps the same look.

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
- Write the chosen gaps into the project's `CLAUDE.md` "Design" section so later changes keep the rhythm.

## 5. Polish: the finishing touches

Spacing is the first step. Eight more things decide whether an app feels finished. Do them by default on any app with cards, lists or media. They need no new packages.

1. **Three type sizes, no more.** Add these utilities to `src/index.css` and use only them in app components; no loose `text-xs` / `text-sm` / `text-lg`:

   ```css
   @utility type-title   { font-family: var(--font-heading); font-size: 1.5rem; line-height: 1.3; font-weight: 900; }
   @utility type-body    { font-size: 0.9375rem; line-height: 1.65; }  /* descriptions, labels, list items */
   @utility type-caption { font-size: 0.8125rem; line-height: 1.5; }   /* hints, scores, categories, small buttons */
   ```

   Name them `type-*`, not `text-*`: shadcn's `cn()` would read `text-caption` as a color and drop it. Numbers next to bars or counts get `tabular-nums`. Fine print on top of photos (credits) may stay 11px.
2. **Never an empty black box while loading.** Show something real first: a video sits on top of its poster photo with a small "불러오는 중…" pill and fades in (opacity transition) a moment after the player loads; images fade in on `onLoad` instead of popping in.
3. **Gestures answer back.** While a card is dragged, tint it toward the choice (green ring = 좋아요/찜, red = 패스) and let the next card grow into place (scale 0.95 → 1). Put the numbers (drag progress 0..1, the behind-card transform) in `src/logic/` with tests; the component only applies them.
4. **The user's picks stay, and can be undone.** A list the user builds (likes, favorites, a cart) survives a refresh: a hook saves only the ids in `localStorage`, and a tested logic function restores them, skipping unknown ids, duplicates and junk so an old save never breaks the page. Wrap storage calls in try/catch. Every item gets a remove (×) button with a toast. With login (level 1+), save to Firestore instead (`add-database`).
5. **Give the flow an ending.** When a deck or list runs out, do not stop at "다 봤어요". Show a result, e.g. "오늘은 이거!": one random pick from what they chose, with "다른 거 뽑기" (never the same pick twice in a row), "자세히 보기" (deep link) and "다시 시작".

6. **Clickable things show the hand cursor on desktop.** Tailwind v4 (used by current shadcn) sets buttons back to the normal arrow, so add this once to `src/index.css` and every button, link and clickable card shows the pointer:

   ```css
   @layer base {
     button:not(:disabled), [role="button"]:not([aria-disabled="true"]), a[href], summary,
     label[for], select, input[type="checkbox"], input[type="radio"], input[type="range"],
     [data-clickable] { cursor: pointer; }
     :disabled, [aria-disabled="true"] { cursor: not-allowed; }
   }
   ```

   - A `div` or card with `onClick` is not a button to the browser: make it a `<button>` or `<a>` (better for keyboards too), or give it `role="button"` and `tabIndex={0}`.
   - Draggable things (swipe cards, sliders' handles) use `cursor-grab`, and `active:cursor-grabbing` while held.
   - Before calling a screen done, hover every clickable thing on desktop once; an arrow over something clickable is a bug.
7. **Links to other sites open in a new tab**, so the visitor never loses the app. Make one component and use it for every outside link (YouTube, photo credits, sources, maps):

   ```tsx
   // src/components/external-link.tsx
   export function ExternalLink({ href, children, ...rest }: React.ComponentProps<"a">) {
     return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
   }
   ```

   - Links inside the app (`/games/:id`, the home page) stay in the same tab with React Router `<Link>`.
   - Never write a bare `<a href="https://...">` in components; search for `href="http` before calling a screen done.
   - Optional: a small ↗ icon after the text so people know it leaves the site.
8. **App-style screen: the header stays, only the content scrolls.** Build every screen like an app, not a long document: the page fills the viewport exactly (`h-dvh flex flex-col overflow-hidden`), the header (and any bottom tab bar) stays fixed (`shrink-0`), and only the content area scrolls (`flex-1 min-h-0 overflow-y-auto`). This is the default for lists and feeds; the whole page never scrolls.

Also add this once to `src/index.css`, so people who turned on "동작 줄이기" on their device get no fly-out animations:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}
```

Record the type scale and the motion rules in the project's `CLAUDE.md` "Design" section.

## 6. Toast messages (default for every project)

Success and error messages are shown as toasts with **Sonner** (shadcn/ui's toast component), never with `alert()` or ad-hoc banners.

- Install: `npx shadcn@latest add sonner` (creates `src/components/ui/sonner.tsx`).
- Copy `${CLAUDE_PLUGIN_ROOT}/templates/notify.ts` to `src/lib/notify.ts`.
- Mount exactly one `<Toaster {...TOASTER_DEFAULTS} />` at the app root (`App.tsx`), imported from `@/components/ui/sonner`.
- Defaults: **bottom-center**, **auto-dismiss after 5 seconds**, close button shown.
- If a message must stay until the user closes it (the owner asks for it, or it is something the user must act on), use `{ persistent: true }`: `notify.error('저장에 실패했어요. 다시 시도해 주세요.', { persistent: true })`.
- Always call `notify.success / error / info / warning` from `src/lib/notify.ts`, not `toast` directly, so the defaults stay in one place. Call it from hooks or event handlers, not from `src/logic/` (logic stays pure).
- Messages are short, plain Korean, and say what happened plus what to do next if it failed.

## 7. "이 사이트처럼 해 줘"

If the user shares a screenshot or URL: describe what you see in 3-5 traits (layout, color, type, spacing, motion), confirm with the user, then apply. Do not copy logos, brand names, text or images from the reference.

## 8. Before/after

When the user asks why this matters, show it: keep a screenshot of the plain version, then the styled one, side by side.
