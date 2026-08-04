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
 * built from — one file, served from this origin, and the only video the
 * page above the fold has to fetch.
 *
 * The poster is the film's own first frame, so the still and the video line
 * up exactly and the crossfade between them is invisible: the intro can
 * open on the poster the instant the HTML lands and let the picture take
 * over underneath it without anything on screen moving.
 */
function getHeroAssets(): HeroAssets {
  return {
    videoSrc: FILM_SRC,
    posterSrc: "/assets/hero/hero-poster.webp",
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
 * The home page is two acts. The hero is one screen: an intro that opens
 * into the kitchen film, cut to an organic shape and standing in a room of
 * drifting type. Below it everything else — the lineup, the story, both
 * packs, the ritual and the promise — is one continuous flight through a
 * single 3D world rather than a stack of separate sections.
 */
export default function HomePage() {
  const stagePacks = getStagePacks();

  return (
    <main id="main">
      <Hero assets={getHeroAssets()} />
      <HomeWorld packs={stagePacks} products={products} />
    </main>
  );
}
