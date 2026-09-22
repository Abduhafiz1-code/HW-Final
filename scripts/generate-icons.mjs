// Yangi Socrati logo SVG'dan barcha PWA ikonkalarni generatsiya qiladi.
// Ishlatish: node scripts/generate-icons.mjs
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";

const svg = readFileSync(resolve("public/favicon.svg"));

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/maskable-192.png", size: 192, pad: 0.08 },
  { file: "public/icons/maskable-512.png", size: 512, pad: 0.08 },
  { file: "public/icons/apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  const pad = t.pad ? Math.round(t.size * t.pad) : 0;
  const inner = t.size - pad * 2;
  // Maskable: SVG'ni to'liq maydon bo'ylab (radius maskalanadi) + padding bilan joylaymiz
  const svgStr = pad
    ? svg
        .toString()
        .replace(/width="\d+" height="\d+"/, `width="${inner}" height="${inner}"`)
    : svg;
  const img = sharp(Buffer.from(svgStr), { density: 300 })
    .resize(inner, inner)
    .png();
  if (pad) {
    await img
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 49, g: 46, b: 129, alpha: 1 }, // #312e81 fon bilan to'ldirish
      })
      .toFile(t.file);
  } else {
    await img.toFile(t.file);
  }
  console.log(`✓ ${t.file} (${t.size}×${t.size})`);
}

// og-image (1200×630) — markazda logo + fon
const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#312e81"/>
      <stop offset="0.55" stop-color="#4338ca"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(456,171)">
    <svg width="288" height="288" viewBox="0 0 512 512">${svg.toString().replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}</svg>
  </g>
  <text x="600" y="540" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="72" fill="#fde68a" letter-spacing="14">SOCRATI</text>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile("public/og-image.png");
console.log("✓ public/og-image.png (1200×630)");

// favicon.ico (32×32 PNG-based ico — brauzerlar qabul qiladi)
const ico32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
writeFileSync("public/favicon.ico", ico32);
console.log("✓ public/favicon.ico (32×32)");
