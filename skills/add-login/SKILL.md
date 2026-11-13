---
name: add-login
description: Add login/authentication to the app with Firebase Authentication, choosing from a level menu (none, email+password, Google, allowlist for internal tools). Use when the user wants login, sign-up, members, "only my team can see it", Google login ("로그인 넣어줘", "회원가입", "구글 로그인", "우리 팀만 보게", "아무나 못 들어오게", "비밀번호").
---

# Login levels

Always show this menu (adapt wording to the user's explain level) and let them choose:

| 단계 | 방식 | 이럴 때 | 비용·난이도 |
|---|---|---|---|
| 0 | 로그인 없음 | 누구나 보는 사이트 | 무료 · 가장 쉬움 |
| 1 | 이메일 + 비밀번호 | 회원 기능 기본형 | 무료 · 쉬움 (비밀번호 재설정 메일 자동) |
| 2 | 구글 로그인 | 가입이 귀찮지 않게 | 무료 · 쉬움 (버튼 하나) |
| 3 | 구글 로그인 + 허용 목록 | 우리 팀·친구만 (내부 도구) | 무료 · 보통 (데이터 규칙에서 막음) |

Levels 1 and 2 can be combined. Phone/SMS login is NOT in the default menu (SMS costs money); mention it only if asked.

Save the choice in `.launchpad/profile.json` → `loginLevel`.

## Key message (say it once)

"화면에서 버튼을 숨기는 건 보안이 아니에요. 데이터 규칙에서 막아야 진짜 막힌 거예요." Level 3 must be enforced in `firestore.rules`, not only in React.

## Human steps (Firebase console)

You cannot click the console. Guide the user step by step and wait for "했어":

1. Firebase console → 프로젝트 → Build → Authentication → 시작하기
2. Sign-in method → enable 이메일/비밀번호 (level 1) and/or Google (level 2-3; pick a support email)
3. After deploy with a custom domain: Authentication → Settings → 승인된 도메인 → add the domain

If the project does not exist yet, run the project-creation part of the `deploy` skill first.

## Code (logic separated from screens)

- `src/lib/firebase.ts` — initializeApp with the web config (the web `apiKey` is a public identifier, it is OK in frontend code; explain this if the user worries)
- `src/hooks/useAuth.ts` — current user, loading state, `signInWithGoogle`, `signInWithEmail`, `signUpWithEmail`, `resetPassword`, `signOut`
- `src/logic/access.ts` — pure function `isAllowed(email, allowlist)` (+ tests: case-insensitive, domain rule like `@company.com`, empty list)
- `src/components/LoginScreen.tsx`, `src/components/RequireLogin.tsx` — UI only

Korean error messages: map Firebase error codes (`auth/wrong-password`, `auth/invalid-credential`, `auth/email-already-in-use`, `auth/weak-password`, `auth/popup-closed-by-user`) to friendly Korean sentences in a pure function with a test.

## Level 3 allowlist rules

Store the allowlist in Firestore `config/access` (`emails: [...]`, `domains: [...]`) editable only by the owner, or hard-code it in rules for very small teams. Example rule helper:

```
function isMember() {
  return request.auth != null &&
    (request.auth.token.email in get(/databases/$(database)/documents/config/access).data.emails
     || request.auth.token.email.matches('.*@company[.]com$'));
}
```

Also require `request.auth.token.email_verified == true` for email/password users at level 3.

After deploy, verify with the user: open the site in a private/incognito window with a non-allowed account and confirm it is blocked.
