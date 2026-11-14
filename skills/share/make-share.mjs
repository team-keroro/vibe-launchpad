#!/usr/bin/env node
// Make share files for a deployed site: QR code (PNG + SVG) and a 1200x630 share card (PNG + SVG).
// Run from the project root after: npm install -D qrcode @resvg/resvg-js
// Usage:
//   node make-share.mjs --url https://my-app.web.app --title "오늘 뭐 먹지?" \
//     [--subtitle "카드를 밀어서 점심 고르기"] [--out share] [--bg "#0b0d17"] [--fg "#e6ebff"] [--accent "#3fd8ff"] [--font path.ttf]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] ?? '';
}
if (!args.url || !args.title) {
  console.error('Usage: node make-share.mjs --url <https://...> --title <text> [--subtitle <text>] [--out share]');
  process.exit(1);
}
if (!/^https:\/\//.test(args.url)) {
  console.error('The url must start with https://');
  process.exit(1);
}

// Resolve packages from the project, not from this script's folder.
const require = createRequire(join(process.cwd(), 'package.json'));
let QRCode, Resvg;
try {
  QRCode = require('qrcode');
  ({ Resvg } = require('@resvg/resvg-js'));
} catch {
  console.error('Missing packages. Run: npm install -D qrcode @resvg/resvg-js');
  process.exit(1);
}

const out = resolve(args.out || 'share');
mkdirSync(out, { recursive: true });
const bg = args.bg || '#111316';
const fg = args.fg || '#EDEEF0';
const accent = args.accent || '#C6F36B';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const fontFamily = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Noto Sans CJK KR', sans-serif";

// 1. QR code: dark modules on white, with a quiet zone, so every phone camera reads it.
const qrOpts = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#000000', light: '#ffffff' } };
await QRCode.toFile(join(out, 'qr.png'), args.url, { ...qrOpts, width: 800 });
const qrSvg = await QRCode.toString(args.url, { ...qrOpts, type: 'svg' });
writeFileSync(join(out, 'qr.svg'), qrSvg);

// 2. Share card (also usable as the link-preview image).
const qrInner = qrSvg.replace(/^[\s\S]*?<svg[^>]*viewBox="([^"]+)"[^>]*>/, (_m, vb) => `<svg x="800" y="155" width="320" height="320" viewBox="${vb}" shape-rendering="crispEdges">`);
const wrap = (text, max) => {
  const lines = [];
  let line = '';
  for (const word of String(text).split(' ')) {
    if ((line + ' ' + word).trim().length > max && line) { lines.push(line); line = word; }
    else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
};
const titleLines = wrap(args.title, 14);
const subLines = args.subtitle ? wrap(args.subtitle, 26) : [];
const host = args.url.replace(/^https:\/\//, '').replace(/\/$/, '');
let y = 250 - (titleLines.length - 1) * 40;
const titleSvg = titleLines.map((t) => { const s = `<text x="80" y="${y}" font-size="68" font-weight="800" fill="${fg}">${esc(t)}</text>`; y += 84; return s; }).join('');
y += 10;
const subSvg = subLines.map((t) => { const s = `<text x="80" y="${y}" font-size="32" fill="${fg}" fill-opacity="0.72">${esc(t)}</text>`; y += 46; return s; }).join('');
const cardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="${fontFamily}">
<rect width="1200" height="630" fill="${bg}"/>
<rect x="40" y="40" width="1120" height="550" rx="28" fill="none" stroke="${fg}" stroke-opacity="0.14" stroke-width="2"/>
<rect x="80" y="110" width="56" height="6" rx="3" fill="${accent}"/>
${titleSvg}${subSvg}
<text x="80" y="540" font-size="30" font-weight="700" fill="${accent}">${esc(host)}</text>
<rect x="780" y="135" width="360" height="360" rx="24" fill="#ffffff"/>
${qrInner}
<text x="960" y="540" font-size="24" text-anchor="middle" fill="${fg}" fill-opacity="0.72">카메라로 찍으면 열려요</text>
</svg>`;
writeFileSync(join(out, 'card.svg'), cardSvg);
const fontOpts = { loadSystemFonts: true, defaultFontFamily: 'Apple SD Gothic Neo' };
if (args.font) fontOpts.fontFiles = [resolve(args.font)];
const png = new Resvg(cardSvg, { font: fontOpts, fitTo: { mode: 'width', value: 1200 } }).render().asPng();
writeFileSync(join(out, 'card.png'), png);

console.log(`Made:\n  ${join(out, 'qr.png')}\n  ${join(out, 'qr.svg')}\n  ${join(out, 'card.png')}\n  ${join(out, 'card.svg')}`);
