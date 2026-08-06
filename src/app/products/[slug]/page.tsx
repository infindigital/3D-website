import { existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductHero from "@/components/product/ProductHero";
import DishParade from "@/components/product/DishParade";
import BlendStory from "@/components/product/BlendStory";
import OtherPack from "@/components/product/OtherPack";
import CrispCase from "@/components/product/gobi/CrispCase";
import BlendMakeup from "@/components/product/gobi/BlendMakeup";
import RecipeFilm from "@/components/product/gobi/RecipeFilm";
import PlatterStage from "@/components/product/gobi/PlatterStage";
import AgainstOrdinary from "@/components/product/gobi/AgainstOrdinary";
import PackShelf from "@/components/product/gobi/PackShelf";
import PromiseBanner from "@/components/product/gobi/PromiseBanner";
import GobiClose from "@/components/product/gobi/GobiClose";
import SixtyFiveOpen from "@/components/product/chicken65/SixtyFiveOpen";
import SixtyFiveFilm from "@/components/product/chicken65/SixtyFiveFilm";
import PlateOff from "@/components/product/chicken65/PlateOff";
import SixtyFiveTable from "@/components/product/chicken65/SixtyFiveTable";
import SixtyFiveClose from "@/components/product/chicken65/SixtyFiveClose";
import { getProduct, products } from "@/config/products";

/**
 * The slug whose page has its own set of sections below the hero, built from
 * the photography, recipe film and plating sheet the owner supplied for it.
 * Every other product falls back to the shared story.
 */
const GOBI_SLUG = "gobi-manchurian-masala";

/** The pack whose page carries the Chicken 65 chapter below the shared story. */
const THREE_IN_ONE_SLUG = "three-in-one-masala";

interface Props {
  params: Promise<{ slug: string }>;
}

const publicDir = join(process.cwd(), "public");

function has(publicPath: string): boolean {
  return existsSync(join(publicDir, ...publicPath.split("/").filter(Boolean)));
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline} ${product.description}`,
    openGraph: has(product.images.front)
      ? { images: [product.images.front] }
      : undefined,
  };
}

/**
 * The full product experience: pinned 3D pack flip, then the story of the
 * pack, then a hand-off to the other one. Gobi Manchurian has photography,
 * a recipe film and a plating sheet of its own, so below the shared hero it
 * runs its own sections; everything else keeps the shared pair. All package
 * imagery is owner-supplied and file-gated, never generated.
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const other = products.find((p) => p.slug !== product.slug);
  const isGobi = product.slug === GOBI_SLUG;
  const isThreeInOne = product.slug === THREE_IN_ONE_SLUG;

  return (
    <main>
      <ProductHero
        product={product}
        hasFront={has(product.images.front)}
        hasBack={has(product.images.back)}
      />
      {isGobi ? (
        <>
          {/* The six claims run as a band straight off the hero, then the
              sizes. Someone who has just been shown the pack is deciding how
              much of it to buy, not reading a case for it — the case is what
              keeps them here afterwards. */}
          <PromiseBanner product={product} />
          <PackShelf product={product} />
          <CrispCase product={product} />
          <BlendMakeup product={product} />
          <RecipeFilm product={product} />
          <PlatterStage product={product} />
          <AgainstOrdinary product={product} />
          <GobiClose product={product} />
        </>
      ) : (
        <>
          <DishParade product={product} />
          <BlendStory product={product} hasBack={has(product.images.back)} />
          {/* The Chicken 65 chapter. It is the 3 in 1 pack's own photography,
              film and printed method, so it is gated on that slug rather than
              on "not Gobi" — a third product added later gets the shared story
              and nothing that belongs to this one. It runs after the pack's own
              story and before the hand-off, so the page still ends on somewhere
              to go rather than burying that link halfway down. */}
          {isThreeInOne && (
            <>
              <SixtyFiveOpen product={product} />
              <SixtyFiveFilm product={product} />
              <PlateOff product={product} />
              <SixtyFiveTable product={product} />
              <SixtyFiveClose
                product={product}
                hasFront={has(product.images.front)}
              />
            </>
          )}
        </>
      )}
      {/* The Gobi page ends on its own order panel. The cross-link to the other
          pack sat after it and undid it — a page that has just asked for the
          sale should not follow that with somewhere else to go. Every other
          product still hands off. */}
      {!isGobi && other && (
        <OtherPack product={other} hasFront={has(other.images.front)} />
      )}
    </main>
  );
}
