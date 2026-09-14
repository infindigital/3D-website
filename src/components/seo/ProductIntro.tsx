import Link from "next/link";
import type { Product } from "@/config/products";
import styles from "./ProductIntro.module.css";

/**
 * Which of the two compositions this page gets.
 *
 * They carry the same three things — a heading, a paragraph and the dishes
 * the pack makes — and they are laid out differently on purpose. One block
 * of centred prose repeated on both product pages read as a template with
 * the words swapped, which is exactly what it looked like.
 *
 * "rule"  the gobi page. A single measured column hung off an accent rule,
 *         with the dishes set as a rank of chips beneath it. The pack is one
 *         dish done several ways, so the list reads as variations.
 *
 * "index" the 3 in 1 page. The heading and the paragraph take the left, and
 *         the dishes stand numbered down the right. That pack's whole claim
 *         is that it is three named dishes in one bag, so the list is the
 *         argument and is given the weight of one.
 */
export type IntroVariant = "rule" | "index";

interface ProductIntroProps {
  product: Product;
  /** The other pack, linked in a sentence rather than sold in a banner */
  other?: Product;
  variant?: IntroVariant;
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
export default function ProductIntro({
  product,
  other,
  variant = "rule",
}: ProductIntroProps) {
  const dishes = product.dishes.slice(0, 3);

  const cross = other && (
    <p className={styles.cross}>
      Cooking something else tonight? The{" "}
      <Link className={styles.crossLink} href={`/products/${other.slug}`}>
        RS Chef&rsquo;z {other.name}
      </Link>{" "}
      covers {other.dishes.slice(0, 3).join(", ").toLowerCase()} from one pack.
    </p>
  );

  return (
    <section
      className={styles.intro}
      data-variant={variant}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-labelledby="intro-heading"
    >
      <div className={styles.inner}>
        {variant === "index" ? (
          <>
            <div className={styles.column}>
              <p className={styles.eyebrow}>One pack, three dishes</p>
              <h2 className={styles.heading} id="intro-heading">
                {product.seo.subheading}
              </h2>
              <p className={styles.body}>{product.seo.intro}</p>
            </div>

            {/* The dishes as the numbered argument they are, not as
                decoration: the names are already in the paragraph, so this
                is marked aria-hidden rather than read out twice. */}
            <ol className={styles.ledger} aria-hidden="true">
              {dishes.map((dish, index) => (
                <li key={dish} className={styles.ledgerItem}>
                  <span className={styles.ledgerNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.ledgerName}>{dish}</span>
                </li>
              ))}
            </ol>

            {/* Below both columns rather than inside the prose, so that when
                the grid stacks on a phone the pointer to the other pack is
                still the last thing read rather than being followed by a
                list. */}
            {cross && <div className={styles.crossRow}>{cross}</div>}
          </>
        ) : (
          <div className={styles.column}>
            <p className={styles.eyebrow}>What it is</p>
            <h2 className={styles.heading} id="intro-heading">
              {product.seo.subheading}
            </h2>
            <p className={styles.body}>{product.seo.intro}</p>

            <ul className={styles.chips} aria-hidden="true">
              {dishes.map((dish) => (
                <li key={dish} className={styles.chip}>
                  {dish}
                </li>
              ))}
            </ul>

            {cross}
          </div>
        )}
      </div>
    </section>
  );
}
