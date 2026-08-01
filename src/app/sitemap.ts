import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { products } from "@/config/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return [
    {
      url: base,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
