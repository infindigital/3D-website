/**
 * Builds the offline copy — the one that opens by double-clicking
 * index.html, with no server anywhere.
 *
 * Run:  npm run build:offline
 * Out:  out-offline/
 *
 * This is a preview package. It must never be uploaded to Hostinger: the
 * paths are relative and the product URLs are flattened, both of which are
 * wrong for a real host and would undo the SEO work. The Hostinger build is
 * `npm run build:static`, and the two are kept in separate folders so they
 * cannot be confused.
 *
 * Three things have to change, and each is forced by how a browser treats
 * file:// rather than chosen:
 *
 * 1. assetPrefix "." (set in next.config.ts by FILE_BUILD) makes Next's own
 *    script and stylesheet links relative to the document instead of to a
 *    site root that does not exist off a disk.
 *
 * 2. The pages are flattened to one directory. This is the part that is not
 *    optional: the JavaScript chunks are shared by every page, so a path
 *    written inside a chunk is resolved against whatever page loaded it. A
 *    relative path can only be correct for every page if every page sits at
 *    the same depth. products/x.html becomes x.html for that reason alone.
 *
 * 3. The asset paths the application hands to the three.js loaders, the
 *    video elements and next/image are rewritten from /assets/... to
 *    ./assets/... . assetPrefix cannot do this: those are strings in the
 *    app's own data, not asset references Next emits, which is why the
 *    naive attempt crashed on the first pack texture instead of merely
 *    looking wrong.
 */
import { execSync } from "node:child_process";
import { readdir, readFile, writeFile, rename, rm, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const DEST = join(ROOT, "out-offline");

/** Every file under a directory, recursively. */
async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else found.push(full);
  }
  return found;
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

console.log("\n  Building the offline copy...\n");

await rm(OUT, { recursive: true, force: true });
await rm(DEST, { recursive: true, force: true });
await rm(join(ROOT, ".next"), { recursive: true, force: true });

execSync("next build", {
  stdio: "inherit",
  env: {
    ...process.env,
    STATIC_EXPORT: "1",
    FILE_BUILD: "1",
    /* Canonical tags and structured data still name the real site. They are
       inert offline and correct if anyone views source. */
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://rschefz.com",
  },
});

await rename(OUT, DEST);

/* ---- flatten the product pages ------------------------------------- */

const productsDir = join(DEST, "products");
const slugs = [];

if (await exists(productsDir)) {
  for (const entry of await readdir(productsDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".html")) {
      const slug = entry.name.replace(/\.html$/, "");
      slugs.push(slug);
      await rename(join(productsDir, entry.name), join(DEST, entry.name));
    }
  }
  /* The leftovers are the RSC payload files the client router would fetch,
     and fetch does not work off a disk. Removing them keeps the folder
     honest about what it can do. */
  await rm(productsDir, { recursive: true, force: true });
}

console.log(`\n  Flattened ${slugs.length} product pages: ${slugs.join(", ")}`);

/* ---- rewrite paths -------------------------------------------------- */

const TEXT = new Set([".html", ".js", ".css", ".txt", ".json"]);
let rewritten = 0;

for (const file of await walk(DEST)) {
  if (!TEXT.has(extname(file))) continue;

  const before = await readFile(file, "utf8");
  let after = before;

  /* Root-relative asset paths -> document-relative. The quote in the
     pattern is what keeps this off the absolute URLs inside the JSON-LD
     and the canonical tag, which must stay absolute. */
  after = after
    .replaceAll('"/assets/', '"./assets/')
    .replaceAll("'/assets/", "'./assets/")
    .replaceAll('"/_next/', '"./_next/')
    .replaceAll("'/_next/", "'./_next/")
    .replaceAll('"/og-image.jpg"', '"./og-image.jpg"')
    .replaceAll('"/favicon.ico"', '"./favicon.ico"');

  /* Product links point at the flattened files. Longest first so a slug
     that is a prefix of another cannot be half-replaced. */
  for (const slug of [...slugs].sort((a, b) => b.length - a.length)) {
    after = after
      .replaceAll(`"/products/${slug}"`, `"./${slug}.html"`)
      .replaceAll(`'/products/${slug}'`, `'./${slug}.html'`);
  }

  /* Home links. Done last and narrowly, so it cannot touch anything else. */
  after = after.replaceAll('href="/"', 'href="./index.html"');

  /*
   * The one patch to Next's own runtime, and the thing that decides whether
   * the 3D appears at all.
   *
   * Turbopack works out where to load further chunks from by reading
   * document.currentScript.src and looking in it for the literal "./_next/"
   * that assetPrefix put in the markup. A browser does not keep that
   * literal: it resolves src to an absolute URL, so what the runtime
   * actually receives off a disk is
   *   file:///C:/Users/.../index_files/_next/static/chunks/x.js
   * which contains "/_next/" and never "./_next/". The lookup misses, the
   * runtime throws InvariantError E784, chunk loading stops, and the canvas
   * is never mounted — pictures and text still render, which is why this
   * looked like "everything but the 3D".
   *
   * Searching for "/_next/" instead is correct for both builds. Off a disk
   * it yields the folder holding _next; served normally the pathname starts
   * at "/_next/", the index is 0, and the prefix slices to "" exactly as
   * before.
   */
  after = after.replaceAll('indexOf("./_next/")', 'indexOf("/_next/")');

  if (after !== before) {
    await writeFile(file, after);
    rewritten += 1;
  }
}

console.log(`  Rewrote paths in ${rewritten} files`);

/* Nothing here belongs to a server. */
for (const junk of [".htaccess", "robots.txt", "sitemap.xml"]) {
  await rm(join(DEST, junk), { force: true });
}

console.log(`\n  Done -> out-offline/\n`);
console.log(`  Open out-offline/index.html directly. No server needed.`);
console.log(`  Do NOT upload this folder to Hostinger — use out/ for that.\n`);
