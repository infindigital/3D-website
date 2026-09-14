/**
 * Builds the browser icons out of the owner-supplied logo.
 *
 * Nothing here is drawn. The only source is public/assets/brand/logo.png,
 * and the only operations are crop, resize and centre — so the mark in a
 * browser tab is the brand's own mark and not a redrawing of it.
 *
 * WHY A CROP RATHER THAN THE WHOLE LOGO
 *
 * The logo is a 1000x426 wordmark, wider than it is tall by 2.3 to 1. A
 * favicon is a square, and browsers still draw it as small as 16px. Fitting
 * the whole wordmark into that square leaves "Chef'z" about four pixels
 * tall: a smear, not a name. The two green pentagons are the part of the
 * mark that survives being tiny — a distinct silhouette in a colour nothing
 * else on the page uses — so they are what the icon carries.
 *
 * WHAT IT WRITES
 *
 *   src/app/favicon.ico      16 + 32 + 48, the tab and the bookmarks bar
 *   src/app/icon.png         512, what modern browsers prefer
 *   src/app/apple-icon.png   180, the iOS home screen
 *
 * The first two keep the logo's transparency, so the mark sits correctly on
 * a light or a dark tab. The Apple icon is flattened onto white: iOS ignores
 * transparency and composites onto black, which would put a dark ground
 * behind a brand that has none.
 *
 * The file names are Next's App Router convention — each one is picked up
 * during the build and turned into its own <link> tag, in both the Node
 * build and the static export. There is no list of icons to keep in step.
 *
 * Run: npm run build:icons  (only needed if logo.png is ever replaced)
 */
import { Buffer } from "node:buffer";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const LOGO = join(ROOT, "public", "assets", "brand", "logo.png");
const APP = join(ROOT, "src", "app");

/**
 * The pentagon pair inside the logo, measured off the artwork's own alpha
 * channel rather than guessed. If the logo is ever redrawn, re-measure: the
 * build prints the region it used.
 */
const MARK = { left: 0, top: 0, width: 362, height: 170 };

/**
 * How much of the square the mark is allowed to fill. A little air on every
 * side stops the icon reading as a crop of something larger, and keeps it
 * clear of the rounded corners some platforms apply.
 */
const FILL = 0.94;

/** The mark on a transparent square of exactly `size` pixels. */
async function tile(size, background) {
  const inner = Math.round(size * FILL);
  const mark = await sharp(LOGO)
    .extract(MARK)
    /* `inside` keeps the mark's own proportions; it is the width that runs
       out first, so the result is `inner` wide and short of `inner` tall. */
    .resize(inner, inner, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * Packs PNGs into an .ico.
 *
 * An .ico is a six-byte header, one sixteen-byte directory entry per image,
 * then the images themselves. Every format Windows has ever accepted is
 * allowed in there; PNG is one of them and has been since Vista, which is
 * why no bitmap encoding is needed. A side of 256 is written as 0, the
 * format's way of saying "not less than 256" — not reachable here, but the
 * arithmetic is left honest.
 */
function ico(images) {
  const HEADER = 6;
  const ENTRY = 16;
  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = HEADER + ENTRY * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(ENTRY);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette size, 0 = not paletted
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const ICO_SIZES = [16, 32, 48];

const inIco = await Promise.all(
  ICO_SIZES.map(async (size) => ({ size, data: await tile(size, CLEAR) })),
);

await writeFile(join(APP, "favicon.ico"), ico(inIco));
await writeFile(join(APP, "icon.png"), await tile(512, CLEAR));
await writeFile(join(APP, "apple-icon.png"), await tile(180, WHITE));

const { left, top, width, height } = MARK;
console.log(`mark taken from logo.png at ${left},${top} ${width}x${height}`);
console.log(`favicon.ico    ${ICO_SIZES.join(" + ")}`);
console.log("icon.png       512, transparent");
console.log("apple-icon.png 180, on white");
