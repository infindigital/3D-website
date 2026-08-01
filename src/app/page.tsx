import { existsSync } from "fs";
import { join } from "path";
import Hero, { type HeroAssets } from "@/components/sections/Hero";
import HomeWorld from "@/components/home/HomeWorld";
import type { StagePack } from "@/three/world/types";
import { products } from "@/config/products";
import { FILM_SRC } from "@/three/world/film";

const publicDir = join(process.cwd(), "public");

function has(publicPath: string): boolean {
  return existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));
}

/**
 * The hero plays the same owner-shot kitchen film the world below it is
 * built from — one file, served from this origin.
 *
 * Same-origin is not incidental. The hero scrubs the film against the
 * scroll, which means fetching the whole thing into a blob so every seek is
 * local; a cross-origin host that sends no CORS headers kills that fetch
 * and the hero silently degrades to unscrubbable streaming.
 *
 * The poster is the film's own first frame, so the still and the video line
 * up exactly and the dissolve between them is invisible.
 */
function getHeroAssets(): HeroAssets {
  return {
    videoSrc: FILM_SRC,
    posterSrc: "/assets/hero/hero-poster.webp",
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
