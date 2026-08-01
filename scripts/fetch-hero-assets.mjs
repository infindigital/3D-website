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
    url: `${CDN}/hf_20260801_093933_87e152a2-bf03-4cbe-a524-908b4d030b34.mp4`,
  },
  {
    dest: "public/assets/hero/hero-poster.webp",
    url: `${CDN}/hf_20260801_093229_56726257-ad69-4c27-9c60-eb9faa3515ea_min.webp`,
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
