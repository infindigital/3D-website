import Link from "next/link";
import type { Product } from "@/config/products";
import styles from "./ProductIntro.module.css";

interface ProductIntroProps {
  product: Product;
  /** The other pack, linked in a sentence rather than sold in a banner */
  other?: Product;
}

/**
 * The page's first H2 and its plain-language paragraph.
 *
 * The hero above carries the H1 and the brand voice; this says the same
 * thing in the words someone would actually type into a search box, which
 * the hero's copy deliberately does not. It sits between them rather than
 * replacing either.
 *
 * The cross-link is the site's internal linking doing real work: a reader
 * on the gobi page who wants chicken has one obvious way across, and the
 * anchor text names the other product rather than saying "click here".
 */
export default function ProductIntro({ product, other }: ProductIntroProps) {
  return (
    <section
      className={styles.intro}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-labelledby="intro-heading"
    >
      <div className={styles.inner}>
        <h2 className={styles.heading} id="intro-heading">
          {product.seo.subheading}
        </h2>
        <p className={styles.body}>{product.seo.intro}</p>

        {other && (
          <p className={styles.cross}>
            Cooking something else tonight? The{" "}
            <Link
              className={styles.crossLink}
              href={`/products/${other.slug}`}
            >
              RS Chef&rsquo;z {other.name}
            </Link>{" "}
            covers {other.dishes.slice(0, 3).join(", ").toLowerCase()} from one
            pack.
          </p>
        )}
      </div>
    </section>
  );
}
