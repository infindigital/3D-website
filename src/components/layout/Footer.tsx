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
 * different one.
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
        </div>

        <nav className={styles.linksCol} aria-label="Products">
          <p className={styles.colTitle}>Products</p>
          <ul className={styles.linkList}>
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className={styles.link}
                >
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </div>

      <div className={styles.bottom}>
        <p>
          &copy; {year} {siteConfig.name}. All rights reserved.
        </p>
        <p>FSSAI licensed. Product of India.</p>
      </div>
    </footer>
  );
}
