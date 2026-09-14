/**
 * JSON-LD for the site.
 *
 * The rule every builder here follows: assert only what the site itself
 * states and a visitor can check on the page. That is why there is no
 * `offers` on either product (no price is shown anywhere on this site), no
 * `aggregateRating` or `review` (no reviews are published here — the ratings
 * that exist live on Amazon and belong to Amazon), no `sku` or `gtin` (none
 * were supplied), and no `sameAs` on the organisation (no official social
 * profile has been given). Each of those is a field Google will happily
 * render and a customer will believe, so an invented one is a lie with a
 * star rating attached.
 *
 * Every URL resolves through getSiteUrl(), so connecting the production
 * domain rewrites all of this with no code change.
 */

import { absoluteUrl, siteConfig } from "./site";
import type { Product } from "./products";

/** A JSON-LD node. Loose by design — schema.org shapes are not a TS type. */
type Node = Record<string, unknown>;

/** Stable @id anchors, so the graph's nodes can refer to one another. */
export const ORGANISATION_ID = () => `${absoluteUrl("/")}#organisation`;
export const WEBSITE_ID = () => `${absoluteUrl("/")}#website`;

/**
 * The brand. `logo` is only claimed when the owner's file is actually
 * present — the caller checks, because only the server knows.
 */
export function organisationSchema(logoPath?: string): Node {
  const node: Node = {
    "@type": "Organization",
    "@id": ORGANISATION_ID(),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    /* Where the brand operates. Stated on the packs as Product of India. */
    areaServed: {
      "@type": "Country",
      name: siteConfig.country,
    },
  };
  if (logoPath) {
    node.logo = {
      "@type": "ImageObject",
      url: absoluteUrl(logoPath),
    };
  }
  return node;
}

/**
 * The site itself. No SearchAction: there is no internal search on this
 * site, and declaring one that does not exist is a broken promise to the
 * crawler rather than a rich result.
 */
export function webSiteSchema(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    inLanguage: "en-IN",
    publisher: { "@id": ORGANISATION_ID() },
  };
}

/** A trail. Pass it the same steps the visible breadcrumb renders. */
export function breadcrumbSchema(
  crumbs: { name: string; path: string }[],
): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * A product.
 *
 * `offers` is deliberately absent. Google wants a price and an availability
 * on it, this site publishes neither, and an offer without them is worse
 * than no offer. What is here instead is honest: the pack, its brand, its
 * picture, and the two places it can actually be bought, as `url`.
 */
export function productSchema(
  product: Product,
  imagePaths: string[],
  packSizes: string[],
): Node {
  const node: Node = {
    "@type": "Product",
    "@id": `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: `${siteConfig.name} ${product.name}`,
    description: product.seo.intro,
    url: absoluteUrl(`/products/${product.slug}`),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: "Spice blend",
    countryOfOrigin: {
      "@type": "Country",
      name: siteConfig.country,
    },
  };

  if (imagePaths.length) {
    node.image = imagePaths.map((path) => absoluteUrl(path));
  }

  /* The sizes are on the page, so they can be on the node. additionalProperty
     rather than hasVariant: these are the same blend in four weights, not
     four products, and nothing here has its own URL or price to be one. */
  if (packSizes.length) {
    node.additionalProperty = packSizes.map((size) => ({
      "@type": "PropertyValue",
      name: "Pack size",
      value: size,
    }));
  }

  return node;
}

/**
 * FAQ. Only ever built from the questions actually rendered on the page —
 * the caller passes the same array the visible section maps over, so the
 * two cannot drift apart and there is no hidden question here that a reader
 * cannot also find.
 */
export function faqSchema(
  faqs: { question: string; answer: string }[],
): Node {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Wraps nodes into one @graph document, which is one script tag per page. */
export function graph(nodes: Node[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  });
}
