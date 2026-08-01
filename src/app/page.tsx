import { existsSync } from "fs";
import { join } from "path";
import Hero, { type HeroAssets, type HeroPack } from "@/components/sections/Hero";
import ProductStage from "@/components/sections/ProductStage";
import StoryReel from "@/components/sections/StoryReel";
import FlavourScene from "@/components/sections/FlavourScene";
import Ritual from "@/components/sections/Ritual";
import PromiseBand from "@/components/sections/PromiseBand";
import type { StagePack } from "@/three/PackStage";
import { products } from "@/config/products";

const publicDir = join(process.cwd(), "public");

function has(publicPath: string): boolean {
  return existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));
}

/**
 * Checked at build time so the hero renders cleanly while the generated
 * media files are still on their way into public/assets/hero, and the
 * owner-supplied package artwork into public/assets/products.
 */
function getHeroAssets(): HeroAssets {
  const packs: HeroPack[] = products
    .filter((product) => has(product.images.front))
    .map((product) => ({
      src: product.images.front,
      slug: product.slug,
      name: product.name,
    }));

  return {
    video: has("/assets/hero/hero-loop.mp4"),
    poster: has("/assets/hero/hero-poster.webp"),
    chilli: has("/assets/hero/chilli.png"),
    curryLeaf: has("/assets/hero/curry-leaf.png"),
    starAnise: has("/assets/hero/star-anise.png"),
    packs,
  };
}

/**
 * The 3D pack stage needs at least the front artwork. The back face reuses
 * the front until the back scan lands. Package artwork is owner-supplied,
 * never generated, so the whole section stays hidden until it exists.
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

export default function HomePage() {
  const stagePacks = getStagePacks();

  return (
    <main id="main">
      <Hero assets={getHeroAssets()} />
      {stagePacks.length > 0 && <ProductStage packs={stagePacks} />}
      <StoryReel />
      {products.map((product, index) => (
        <FlavourScene
          key={product.slug}
          product={product}
          flip={index % 2 === 1}
          hasFront={has(product.images.front)}
        />
      ))}
      <Ritual />
      <PromiseBand />
    </main>
  );
}
