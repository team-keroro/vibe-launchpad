---
name: remember
description: The user's personal memory list and word book for learning, shared across all projects. Use when the user wants to save something to remember or review what they saved ("기억해 둬", "이거 기억해", "꼭 기억할래", "내 기억 목록 줘", "기억 목록 보여줘", "내 단어장", "복습하자", "퀴즈 내 줘", "오늘 복습", "목록에서 지워줘").
---

# Memory list

Forgetting is normal; looking things up again should take one sentence. This skill keeps a single list for the user across all projects.

## Storage

- File: `~/.vibe-launchpad/memory.md` (create the folder if missing).
- If the file does not exist yet, create it from `seed.md` (next to this file), then add the new item.
- Format, grouped by section, newest at the bottom of each section:

```markdown
# 내가 기억할 것

## 개념
- **localhost** — 내 방 안의 가게. 친구는 못 들어온다. 세상에 열려면 배포. _(2026-11-12)_

## 보안·비용
- ...

## 내 프로젝트
- **song-ranking** — 음원은 유튜브 일부 공개 링크로. _(2026-11-12)_

## 마법의 한마디
- ...
```

Sections: 개념, 보안·비용, 내 프로젝트, 마법의 한마디, 기타. Create a section if needed.

## Actions

- **"기억해 둬" / "이거 기억해"**: Rewrite what to remember in 1-2 plain sentences at the user's level (if it is a term you just explained via the ladder, store the easiest version that the user understood). Pick a section. Append with today's date. Confirm in one line: "기억 목록 '개념'에 넣었어요." Do not ask for confirmation first unless it is unclear what "this" refers to.
- **"내 기억 목록 줘" / "단어장"**: Show the list grouped by section. If long (>30 items), show section names with counts and ask which one.
- **"퀴즈 내 줘" / "복습하자"**: Pick 3-5 items (favor older ones and the 보안·비용 section), ask one question at a time, wait for the answer, respond kindly, give the short correct answer. Wrong answers are fine: "괜찮아요, 원래 몇 번 까먹어야 기억돼요."
- **"목록에서 지워줘"**: Show the matching item and remove it after the user confirms.

Never store secrets (keys, passwords, tokens) in this file even if asked; store "키는 어디에 있는지" instead.
