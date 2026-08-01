import { existsSync } from "fs";
import { join } from "path";
import Hero, { type HeroAssets } from "@/components/sections/Hero";

/**
 * Checked at build time so the hero renders cleanly while the generated
 * media files are still on their way into public/assets/hero.
 */
function getHeroAssets(): HeroAssets {
  const heroDir = join(process.cwd(), "public", "assets", "hero");
  const has = (name: string) => existsSync(join(heroDir, name));
  return {
    video: has("hero-loop.mp4"),
    poster: has("hero-poster.webp"),
    chilli: has("chilli.png"),
    curryLeaf: has("curry-leaf.png"),
    starAnise: has("star-anise.png"),
  };
}

export default function HomePage() {
  return (
    <main id="main">
      <Hero assets={getHeroAssets()} />
    </main>
  );
}
