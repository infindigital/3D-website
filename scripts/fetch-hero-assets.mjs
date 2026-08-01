/**
 * Downloads the Higgsfield-generated media for the hero section into
 * public/assets. Run from the repo root with: node scripts/fetch-hero-assets.mjs
 *
 * These are dish scenery and textures only. Package artwork and the brand
 * logo are supplied by the owner and are never generated. See
 * docs/HERO_ASSETS.md for the full asset map.
 */

import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3G4bnJPvIHipa5YfpqpDWYcQAig";

const assets = [
  {
    dest: "public/assets/hero/hero-loop.mp4",
    url: `${CDN}/hf_20260801_104539_ce158ce6-a3b8-4b7a-94a6-a1ece909b2fa.mp4`,
  },
  {
    dest: "public/assets/hero/hero-poster.webp",
    url: `${CDN}/hf_20260801_104254_5718f989-817c-4d67-a232-2e22ec424254_min.webp`,
  },
  {
    dest: "public/assets/textures/ingredients-scatter.png",
    url: `${CDN}/hf_20260801_072056_0f7f323e-f0d3-40c1-93f0-e2ee6df3fcb8.png`,
  },
  {
    dest: "public/assets/textures/spice-dust.webp",
    url: `${CDN}/hf_20260801_072058_ceb80041-49a8-4117-8248-20eee18e750c_min.webp`,
  },
];

let failed = 0;

for (const { dest, url } of assets) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(join(process.cwd(), dest)), { recursive: true });
    await writeFile(join(process.cwd(), dest), bytes);
    console.log(`ok  ${dest} (${(bytes.length / 1024).toFixed(0)} KB)`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${dest}: ${error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} download(s) failed.`);
  process.exit(1);
}

console.log("\nAll hero assets downloaded.");
