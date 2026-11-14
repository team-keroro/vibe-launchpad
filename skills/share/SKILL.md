---
name: share
description: Hand over a deployed site in an easy-to-share form - plain link, QR code image, share card (title + QR + address in one image), link preview for KakaoTalk/SNS, or a ready-to-paste message. Use right after a deploy, and when the user says "공유", "QR 코드", "큐알", "친구한테 보내기", "카톡에 올리기", "링크 예쁘게", "미리보기 이미지", "공유 카드".
---

# Share the site

Needs a live address: `deployedUrl` in `.launchpad/profile.json`. If it is null, run `deploy` first.

## 1. 🔸 Ask how they want to share

One question (question tool if available, else a numbered list); they may pick several:

| # | 형식 | 언제 좋은가 |
|---|---|---|
| 1 | 🔗 링크 + 보낼 문장 | 카톡·문자로 바로 보낼 때 |
| 2 | 📱 QR 코드 이미지 | 화면이나 종이에 띄워 놓고 폰으로 찍게 할 때 |
| 3 | 🖼️ 공유 카드 (제목 + QR + 주소가 한 장에) | 단톡방·SNS에 이미지로 올릴 때 |
| 4 | 👀 링크 미리보기 | 링크를 보내면 카톡에 제목·그림이 크게 뜨게 할 때 (사이트를 한 번 더 올려요) |

If they say "알아서", do 1 + 3.

## 2. Make it

**Install once** (dev only, not shipped to visitors): `npm install -D qrcode @resvg/resvg-js`

**QR code and share card** (options 2, 3, 4): run from the project root

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/share/make-share.mjs" --url <deployedUrl> --title "<site name>" --subtitle "<one line>" --bg "<theme background>" --fg "<theme text>" --accent "<theme accent>"
```

- Take the colors from the project's theme (`src/index.css` / the `CLAUDE.md` Design section) so the card matches the site.
- It writes `share/qr.png`, `share/qr.svg`, `share/card.png` (1200×630) and `share/card.svg`.
- Look at `share/card.png` yourself before handing it over: text not cut off, QR fully visible. Keep the title short (2 lines max).
- Test the QR: decode it if you can, or ask the owner to point their phone camera at the image on screen.
- Open the folder for them: `open share` (Mac) or `explorer share` (Windows).

**Link preview** (option 4):
1. Copy `share/card.png` to `public/og.png`.
2. Add to `index.html` `<head>` (absolute URLs, the real site name and line):
   ```html
   <meta property="og:title" content="<site name>">
   <meta property="og:description" content="<one line>">
   <meta property="og:image" content="<deployedUrl>/og.png">
   <meta property="og:url" content="<deployedUrl>">
   <meta name="twitter:card" content="summary_large_image">
   ```
3. Run `deploy` again (it builds, checks and saves first).
4. Tell them: "카톡은 미리보기를 한동안 저장해 둬요. 예전 모습이 뜨면 주소 끝에 `?v=2` 를 붙여 보내 보세요."

**Message** (option 1): write a 2-line message in Korean they can paste, e.g.

```
내가 AI랑 만든 사이트야! 👉 https://retro-games-k7q2.web.app
90년대·2000년대 게임 추억 모아 놨어. 네 추억의 게임도 있나 봐 봐 🕹️
```

## 3. Hand it over

- Show the link as a clickable link and the image paths as full paths.
- One line on safety: "이 주소는 누구나 열 수 있어요. 개인정보는 사이트에 넣지 마세요."
- `share/` holds only images and is fine to keep in Git.
