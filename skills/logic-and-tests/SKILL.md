---
name: logic-and-tests
description: Code structure rule for the kit - keep business logic out of components (pure functions in src/logic with Vitest tests, React custom hooks in src/hooks, UI-only components), and run tests. Use when writing or changing app features, when something keeps breaking, or when the user asks for tests ("테스트 돌려줘", "기능 추가", "자꾸 망가져", "계산이 틀려", "로직").
---

# Kitchen and dining hall

Analogy for the user: components are the dining hall (what guests see); logic is the kitchen recipe. Redecorating the hall must not change the taste. Tests are automatic taste checks.

## Layers

```
src/logic/       pure functions: no React, no Firebase, no fetch. Input → output.
src/logic/*.test.ts   Vitest tests next to each logic file
src/hooks/       custom hooks: state, effects, Firebase/fetch calls; call logic functions
src/components/  UI only: props in, JSX out; call hooks; no calculations, no Firebase
src/lib/         setup (firebase.ts, config)
src/data/        static data files
```

Rules:
- Any calculation, filtering, sorting, scoring, validation, formatting or permission decision goes in `src/logic/` as a pure function.
- Hooks orchestrate: load data, hold state, call logic, expose a small API (`{ items, loading, error, vote() }`).
- Components never import from `firebase/*` directly and never contain `.sort(`/`.filter(` business rules.
- When changing a design, do not touch `src/logic/`. When changing a rule, update its test first.

## Tests

- Framework: Vitest (`npm test` → `vitest run`).
- Each logic function gets tests for: normal case, empty input, edge/tie case.
- Hook tests (`@testing-library/react` `renderHook`) only when a hook has tricky state; not by default.
- After any change to `src/logic/`, run `npm test`. Report in one plain line: "자동 맛보기 12개 모두 통과" or "1개 실패: 동점일 때 순서가 바뀌어요 → 고칠게요".
- The user never needs to read test code. Offer to explain a test with `explain` if they're curious.

## Refactor on the way

If you find logic inside a component while working, move it into `src/logic/` (+ test) as part of the change and mention it in one line.
