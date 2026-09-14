import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { products } from "@/config/products";

/**
 * The three canonical, indexable URLs and nothing else.
 *
 * No Amazon or WhatsApp links — those are outbound conversion destinations
 * on someone else's domain and have no business in this site's sitemap. No
 * query strings or tracking URLs either: a campaign URL is the same page,
 * and the canonical on it already says so.
 *
 * `lastModified` is the build time rather than a per-page date, because
 * that is the only honest answer available. These pages are rebuilt and
 * redeployed together, so the deploy is genuinely when each last changed.
 * `changeFrequency` stays monthly: claiming daily on a catalogue that
 * changes a few times a year is a claim crawlers learn to ignore.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
