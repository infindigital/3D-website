import { existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Hero, { type HeroAssets } from "@/components/sections/Hero";
import HomeWorld from "@/components/home/HomeWorld";
import type { StagePack } from "@/three/world/types";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import { FILM_SRC, FILM_POSTER } from "@/three/world/film";

const publicDir = join(process.cwd(), "public");

function has(publicPath: string): boolean {
  return existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));
}

/**
 * The home page's own metadata, which overrides the layout's defaults.
 *
 * `title.absolute` rather than `title`: the layout appends "| RS Chef'z" to
 * every page title, and this one already ends in the brand.
 *
 * The home page owns the India-wide discovery query. The two product pages
 * own their own product queries, so nothing here competes with them — the
 * point of splitting the three is that none of them cannibalises another.
 */
export const metadata: Metadata = {
  title: {
    absolute: "Gobi Manchurian Masala in India | RS Chef'z",
  },
  description:
    "Shop RS Chef'z Gobi Manchurian Masala in India. A ready-mix spice blend for crispy Gobi Manchurian, gobi fry and tikka, plus a 3 in 1 Masala for Chicken 65 and fish fry. Order on Amazon or WhatsApp.",
  alternates: { canonical: "/" },
  /*
   * These two objects replace the layout's rather than merging into them,
   * so everything the card needs is restated here. Leaving `images` and
   * `card` out cost the home page its social image and downgraded the
   * Twitter card to a thumbnail — silently, since neither is visible on
   * the page itself.
   */
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    url: "/",
    title: "Gobi Manchurian Masala in India | RS Chef'z",
    description:
      "Ready-mix Gobi Manchurian Masala from RS Chef'z, available across India on Amazon and WhatsApp.",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} masala packs`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gobi Manchurian Masala in India | RS Chef'z",
    description:
      "Ready-mix Gobi Manchurian Masala from RS Chef'z, available across India on Amazon and WhatsApp.",
    images: [siteConfig.ogImage],
  },
};

/**
 * The hero plays the same owner-shot kitchen film the world below it is
 * built from — one file, served from this origin, and the only video the
 * page above the fold has to fetch.
 *
 * The poster is the film's own first frame, so the still and the video line
 * up exactly and the crossfade between them is invisible: the intro can
 * open on the poster the instant the HTML lands and let the picture take
 * over underneath it without anything on screen moving. It is the world's
 * poster, the same file rather than a copy of it — the two can then never
 * be regenerated apart.
 *
 * The logo is the one the navigation bar uses, and it is gated the same way
 * the bar gates it: the brand mark is owner-supplied and never generated, so
 * if the file is not there the intro simply has no logo standing in it.
 */
function getHeroAssets(): HeroAssets {
  const logo = "/assets/brand/logo.png";
  return {
    videoSrc: FILM_SRC,
    posterSrc: FILM_POSTER,
    logoSrc: has(logo) ? logo : undefined,
  };
}

/**
 * Warming the film.
 *
 * The film is the heaviest thing on this page, and the element that plays
 * it is not in the first HTML: the hero chooses between the intro and the
 * still hero after hydration, so left alone the download does not start
 * until the bundle has landed and run. On a phone that is seconds of the
 * poster sitting there.
 *
 * This asks for the bytes while the parser is still in the page. The
 * element it makes never enters the document and never plays — it exists to
 * fill the HTTP cache, which the real <video> reads from instead of the
 * network a moment later.
 *
 * `<link rel="preload">` cannot do this job. Chrome rejects `as="video"`
 * outright ("unsupported `as` value") and fetches nothing, and the other
 * `as` values fetch under a different credentials mode, which costs a
 * second download rather than saving the first.
 *
 * The media query is the reduced-motion promise kept: that visitor is shown
 * the poster and never mounts a player, so they must not be made to pay for
 * one. `Hero` drops the reference once its own element has a frame.
 */
const WARM_FILM = `(function(){try{if(!matchMedia("(prefers-reduced-motion: no-preference)").matches)return;var v=document.createElement("video");v.preload="auto";v.muted=true;v.src=${JSON.stringify(
  FILM_SRC,
)};window.__warmFilm=v}catch(e){}})()`;

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
      <script id="warm-film" dangerouslySetInnerHTML={{ __html: WARM_FILM }} />
      <Hero assets={getHeroAssets()} />
      <HomeWorld packs={stagePacks} products={products} />
    </main>
  );
}
