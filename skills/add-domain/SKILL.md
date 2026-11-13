---
name: add-domain
description: Connect the user's own domain (e.g. mysongs.com) to the Firebase-hosted site. Use when the user wants their own address instead of web.app ("내 도메인", "도메인 연결", "주소 바꾸고 싶어", ".com 으로", "도메인 사야 해?").
---

# Custom domain

## Set expectations first

- The free address `<id>.web.app` already works. A custom domain is optional.
- Connecting a domain to Firebase and the HTTPS certificate are free. **The domain itself costs money** (roughly 15,000-25,000 KRW per year for `.com`; renewal prices can be higher than the first year).
- Buying is a human step (payment). You never enter payment details.

## Buying (human step)

Suggest registrars and let the user choose:
- Cloudflare Registrar (at-cost pricing, needs a Cloudflare account)
- Porkbun, Namecheap (simple, English)
- 가비아 (Korean UI; `.kr` / `.한국` domains need Korean registrant info)

Tips to tell them: check the renewal price, turn on auto-renew, keep WHOIS privacy on.

## Connecting (mixed steps)

1. Human: Firebase console → Hosting → 커스텀 도메인 추가 → enter the domain.
2. Firebase shows DNS records (usually TXT for ownership + A records, or a CNAME for `www`). Ask the user to paste them to you or show a screenshot.
3. You: rewrite them as a simple table: "타입 / 이름(호스트) / 값". Explain that `@` means the bare domain.
4. Human: registrar's DNS settings → add each row. Give registrar-specific menu hints if known, and say menu names may differ.
   - Cloudflare DNS: set the records to "DNS only" (gray cloud) until Firebase shows the certificate is issued.
5. Wait: propagation takes minutes to a few hours; certificate issuance can take up to a day. This is normal.
6. You: check with `nslookup <domain>` / `dig <domain>` and report progress in plain words.
7. If the app has login: add the domain in Firebase Authentication → Settings → 승인된 도메인. Otherwise Google login fails on the new domain.
8. Save `domain` in `.launchpad/profile.json`.
