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
import SixtyFiveEdge from "@/components/product/chicken65/SixtyFiveEdge";
import SixtyFiveTable from "@/components/product/chicken65/SixtyFiveTable";
import SixtyFiveClose from "@/components/product/chicken65/SixtyFiveClose";
import Breadcrumbs, { type Crumb } from "@/components/seo/Breadcrumbs";
import ProductIntro from "@/components/seo/ProductIntro";
import FaqSection from "@/components/seo/FaqSection";
import JsonLd from "@/components/seo/JsonLd";
import { c65Packs, c65Promises } from "@/config/chicken65";
import { gobiPacks } from "@/config/gobi";
import { getProduct, products } from "@/config/products";
import { siteConfig } from "@/config/site";
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  productSchema,
} from "@/config/schema";

/** The three lines above the 3 in 1 pack's shelf. The shelf itself is the one
    the Gobi page stands its sizes on, mounted with this range instead. */
const C65_SHELF_COPY = {
  eyebrow: "Pack sizes",
  heading: (
    <>
      A sachet a fry.
      <br />
      A pouch for the month.
    </>
  ),
  lead: (
    <>
      The same 3 in 1 Masala in four sizes — a sachet for the drawer, or five
      kilos for a kitchen that fries every day.
    </>
  ),
};

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

  const path = `/products/${product.slug}`;
  /* The pack's own artwork is the better social card when the owner has
     supplied it — it is the thing being sold. The site card is the fallback
     rather than the default. */
  const social = has(product.images.front)
    ? product.images.front
    : siteConfig.ogImage;

  return {
    /* Absolute: these titles already end in the brand, and the layout's
       template would otherwise append it a second time. */
    title: { absolute: product.seo.title },
    description: product.seo.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      /* Restated, not inherited: a page's openGraph replaces the layout's
         whole object rather than merging into it. */
      siteName: siteConfig.name,
      locale: "en_IN",
      url: path,
      title: product.seo.title,
      description: product.seo.metaDescription,
      images: [{ url: social, alt: `RS Chef'z ${product.name} pack` }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.metaDescription,
      images: [social],
    },
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

  /* One array, two consumers: the visible trail and the BreadcrumbList. */
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: product.name, path: `/products/${product.slug}` },
  ];

  /* Only artwork that is actually on disk is claimed as this product's
     image — the same file-gate the rest of the page uses, applied to the
     structured data so it can never point at a 404. */
  const images = [product.images.front, product.images.back].filter(has);

  const packs = isThreeInOne ? c65Packs : isGobi ? gobiPacks : [];
  const packSizes = packs.map((pack) =>
    pack.unit ? `${pack.size} ${pack.unit}` : pack.size,
  );

  const pageGraph = graph([
    productSchema(product, images, packSizes),
    breadcrumbSchema(crumbs),
    /* Built from the same array FaqSection renders below, so every question
       in the markup is one a reader can see answered on the page. */
    faqSchema(product.seo.faqs),
  ]);

  return (
    <main>
      <JsonLd json={pageGraph} />
      <Breadcrumbs crumbs={crumbs} />
      <ProductHero
        product={product}
        hasFront={has(product.images.front)}
        hasBack={has(product.images.back)}
      />
      {/* The page in plain words, directly under the hero: what this is,
          what it makes, and where it can be bought. Everything below is
          photography, film and a 3D pack, none of which a crawler reads. */}
      <ProductIntro product={product} other={other} />
      {isGobi && (
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
      )}

      {/* The 3 in 1 pack runs the same shape as Gobi's — band, sizes, then its
          own chapter — off its own photography, film and printed method. The
          band and the shelf are Gobi's components mounted with this pack's
          words and sizes rather than second copies of them. */}
      {isThreeInOne && (
        <>
          <PromiseBanner product={product} items={c65Promises} />
          <PackShelf
            product={product}
            packs={c65Packs}
            /* The pouch has not been measured for this pack, and a dimension
               sheet is the one thing here that cannot be inferred from
               another pack's. */
            spec={null}
            copy={C65_SHELF_COPY}
          />
          <SixtyFiveOpen product={product} />
          <SixtyFiveFilm product={product} />
          <PlateOff product={product} />
          <SixtyFiveEdge product={product} />
          <SixtyFiveTable product={product} />
          <SixtyFiveClose
            product={product}
            hasFront={has(product.images.front)}
          />
        </>
      )}

      {/* Anything added to the catalogue later, with no photography of its own
          yet, still gets the shared story and the hand-off to the other pack.
          The two pages that have their own chapter end on their own order
          panel instead — a page that has just asked for the sale should not
          follow that with somewhere else to go. */}
      {!isGobi && !isThreeInOne && (
        <>
          <DishParade product={product} />
          <BlendStory product={product} hasBack={has(product.images.back)} />
          {other && (
            <OtherPack product={other} hasFront={has(other.images.front)} />
          )}
        </>
      )}

      {/* The questions, last, and open rather than folded away — the
          FAQPage node above is only honest while every answer in it is one
          a reader can find on this page. */}
      <FaqSection faqs={product.seo.faqs} accentColor={product.accentColor} />
    </main>
  );
}
