import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

const glyph = (scale = 1) => {
  const cx = 256;
  const t = (v) => cx + (v - cx) * scale;
  return `
    <g fill="#ffffff">
      <path d="M${t(136)} ${t(196)} L${t(376)} ${t(196)} L${t(356)} ${t(132)} L${t(156)} ${t(132)} Z"/>
      <rect x="${t(156)}" y="${t(196)}" width="${t(356) - t(156)}" height="${t(372) - t(196)}" rx="10"/>
    </g>
    <rect x="${t(232)}" y="${t(268)}" width="${t(280) - t(232)}" height="${t(372) - t(268)}" fill="#0f172a"/>
  `;
};

const anySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  ${glyph(1)}
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  ${glyph(0.72)}
</svg>`;

async function gen() {
  await sharp(Buffer.from(anySvg)).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192x192.png'));
  await sharp(Buffer.from(anySvg)).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512x512.png'));
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(path.join(outDir, 'maskable-512x512.png'));
  await sharp(Buffer.from(anySvg)).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(anySvg)).resize(64, 64).png().toFile(path.join(outDir, 'favicon-64.png'));
  console.log('Icons generated in', outDir);
}

gen().catch((e) => {
  console.error(e);
  process.exit(1);
});
