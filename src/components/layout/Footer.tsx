import { existsSync } from "fs";
import { join } from "path";
import Image from "next/image";
import Link from "next/link";
import BuyButtons from "@/components/ui/BuyButtons";
import { siteConfig } from "@/config/site";
import { products } from "@/config/products";
import styles from "./Footer.module.css";

/**
 * Closing band and footer. The invitation to buy sits on a warm gradient,
 * followed by the brand block and the product links. Server rendered, no
 * animation, so the page always ends on solid ground.
 *
 * The page signs off as RS Chef'z and nothing else: no registered name, no
 * address, no other brand's contact details. It is the only name the site
 * uses anywhere, and the footer is the last place it should start using a
 * different one. The one other name here is the studio credit, which is a
 * signature rather than a second brand, and is set to read that way.
 *
 * The product links are the packs themselves. A footer whose only content
 * is two words of link text reads as an afterthought on a page that has
 * just spent a whole scroll showing the packs off; putting the artwork in
 * the link makes the last thing on the page the same thing as the first.
 */
export default function Footer() {
  const hasLogo = existsSync(
    join(process.cwd(), "public", "assets", "brand", "logo.png"),
  );
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>Bring the restaurant home.</h2>
        <p className={styles.ctaSub}>
          Two packs, every favourite. Delivered across India.
        </p>
        <BuyButtons className={styles.ctaButtons} />
      </div>

      <div className={styles.main}>
        <div className={styles.brandCol}>
          {hasLogo ? (
            <Image
              className={styles.logo}
              src="/assets/brand/logo.png"
              alt={siteConfig.name}
              width={1000}
              height={426}
              sizes="150px"
            />
          ) : (
            <p className={styles.brandName}>{siteConfig.name}</p>
          )}
          <p className={styles.tagline}>{siteConfig.tagline}</p>

          {/* The three claims printed on the pack, kept short enough to
              scan in the half-second anyone gives a footer. */}
          <ul className={styles.promise}>
            <li>No artificial colors</li>
            <li>No preservatives</li>
            <li>No artificial flavors</li>
          </ul>
        </div>

        <nav className={styles.linksCol} aria-label="Products">
          <p className={styles.colTitle}>Products</p>
          <ul className={styles.packList}>
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className={styles.packCard}
                >
                  <span className={styles.packShot}>
                    <Image
                      src={product.images.front}
                      alt=""
                      width={1094}
                      height={1403}
                      sizes="96px"
                    />
                  </span>
                  <span className={styles.packText}>
                    <span className={styles.packName}>{product.name}</span>
                    <span className={styles.packDishes}>
                      {product.dishes.join(" · ")}
                    </span>
                  </span>
                  <svg
                    className={styles.packArrow}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h13" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.legal}>
          <span>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </span>
          <span className={styles.sep} aria-hidden="true" />
          <span>FSSAI licensed. Product of India.</span>
        </p>

        <a
          className={styles.credit}
          href="https://infindigital.in/"
          target="_blank"
          rel="noopener"
        >
          <span className={styles.creditLabel}>Developed by</span>
          <span className={styles.creditMark}>
            In<span className={styles.creditSlash}>/</span>Fin
          </span>
          <svg
            className={styles.creditArrow}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7" />
            <path d="M9 7h8v8" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
