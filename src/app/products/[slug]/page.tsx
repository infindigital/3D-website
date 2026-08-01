import { existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductHero from "@/components/product/ProductHero";
import DishParade from "@/components/product/DishParade";
import BlendStory from "@/components/product/BlendStory";
import OtherPack from "@/components/product/OtherPack";
import { getProduct, products } from "@/config/products";

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
 * The full product experience: pinned 3D pack flip, the dishes it cooks,
 * what is inside the blend, then a hand-off to the other pack. All package
 * imagery is owner-supplied and file-gated, never generated.
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const other = products.find((p) => p.slug !== product.slug);

  return (
    <main>
      <ProductHero
        product={product}
        hasFront={has(product.images.front)}
        hasBack={has(product.images.back)}
      />
      <DishParade product={product} />
      <BlendStory product={product} hasBack={has(product.images.back)} />
      {other && (
        <OtherPack product={other} hasFront={has(other.images.front)} />
      )}
    </main>
  );
}
