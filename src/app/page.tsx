import { existsSync } from "fs";
import { join } from "path";
import Hero, { type HeroAssets, type HeroPack } from "@/components/sections/Hero";
import { products } from "@/config/products";

/**
 * Checked at build time so the hero renders cleanly while the generated
 * media files are still on their way into public/assets/hero, and the
 * owner-supplied package artwork into public/assets/products.
 */
function getHeroAssets(): HeroAssets {
  const publicDir = join(process.cwd(), "public");
  const has = (publicPath: string) =>
    existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));

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

export default function HomePage() {
  return (
    <main id="main">
      <Hero assets={getHeroAssets()} />
    </main>
  );
}
