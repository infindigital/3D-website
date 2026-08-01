import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, products } from "@/config/products";

interface Props {
  params: Promise<{ slug: string }>;
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
  };
}

/**
 * Product page. Placeholder for Phase 1.
 * The 3D flip experience, ingredients and buy CTAs arrive in Phase 5.
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>{product.name}</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.25rem" }}>
        {product.tagline}
      </p>
      <p style={{ color: "var(--text-secondary)" }}>
        Phase 1 scaffold. Full product experience arrives in Phase 5.
      </p>
    </main>
  );
}
