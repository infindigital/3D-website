import { existsSync } from "fs";
import { join } from "path";
import Hero, { type HeroAssets } from "@/components/sections/Hero";
import HomeWorld from "@/components/home/HomeWorld";
import type { StagePack } from "@/three/world/types";
import { products } from "@/config/products";
import { heroMediaRemote } from "@/config/heroMedia";

const publicDir = join(process.cwd(), "public");

function has(publicPath: string): boolean {
  return existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));
}

/**
 * Resolved at build time. A committed file under public/assets/hero always
 * wins, so the hero is complete on the very first deploy either way.
 *
 * Until the film lands in the repo it is served through /api/hero-film
 * rather than straight from the Higgsfield CDN: the CDN sends no CORS
 * headers, which kills the browser-side fetch that makes the film
 * scrubbable. The poster has no such problem — next/image already proxies
 * remote stills through this origin.
 */
function resolveMedia(localPath: string, remote: string): string {
  return has(localPath) ? localPath : remote;
}

function getHeroAssets(): HeroAssets {
  return {
    videoSrc: resolveMedia("/assets/hero/hero-loop.mp4", "/api/hero-film"),
    posterSrc: resolveMedia(
      "/assets/hero/hero-poster.webp",
      heroMediaRemote.poster,
    ),
    /* Optional and owner-supplied. The hero only draws its sound toggle
       when this file exists, and never plays it unprompted either way. */
    ambientSrc: has("/assets/hero/ambience.mp3")
      ? "/assets/hero/ambience.mp3"
      : undefined,
  };
}

/**
 * The 3D world needs at least the front artwork for a pack to appear in it.
 * The back face reuses the front until the back scan lands. Package artwork
 * is owner-supplied and never generated, so a pack whose file is missing is
 * simply not placed in the world; the copy about it still is.
 */
function getStagePacks(): StagePack[] {
  return products
    .filter((product) => has(product.images.front))
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      front: product.images.front,
      back: has(product.images.back) ? product.images.back : undefined,
      accent: product.accentColor,
    }));
}

/**
 * The home page is two acts. The hero is a film the scroll plays; below it
 * everything else — the lineup, the story, both packs, the ritual and the
 * promise — is one continuous flight through a single 3D world rather than
 * a stack of separate sections.
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero
        assets={getHeroAssets()}
        hasLogo={has("/assets/brand/logo.png")}
      />
      <HomeWorld packs={getStagePacks()} products={products} />
    </main>
  );
}
