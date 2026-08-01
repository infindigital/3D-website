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
import { heroMediaRemote } from "@/config/heroMedia";

const publicDir = join(process.cwd(), "public");

function has(publicPath: string): boolean {
  return existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));
}

/**
 * Resolved at build time. A committed file under public/assets/hero always
 * wins; until it lands the browser streams the same media straight from
 * the Higgsfield CDN, so the hero is complete on the very first deploy.
 */
function resolveMedia(localPath: string, remote: string): string {
  return has(localPath) ? localPath : remote;
}

function getHeroAssets(): HeroAssets {
  const packs: HeroPack[] = products
    .filter((product) => has(product.images.front))
    .map((product) => ({
      src: product.images.front,
      slug: product.slug,
      name: product.name,
    }));

  return {
    videoSrc: resolveMedia("/assets/hero/hero-loop.mp4", heroMediaRemote.video),
    posterSrc: resolveMedia(
      "/assets/hero/hero-poster.webp",
      heroMediaRemote.poster,
    ),
    chilli: resolveMedia("/assets/hero/chilli.png", heroMediaRemote.chilli),
    curryLeaf: resolveMedia(
      "/assets/hero/curry-leaf.png",
      heroMediaRemote.curryLeaf,
    ),
    starAnise: resolveMedia(
      "/assets/hero/star-anise.png",
      heroMediaRemote.starAnise,
    ),
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
