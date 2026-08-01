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
 * followed by the brand block, product links and the company line from the
 * pack. Server rendered, no animation, so the page always ends on solid
 * ground.
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

        <div className={styles.linksCol}>
          <p className={styles.colTitle}>Company</p>
          <ul className={styles.linkList}>
            <li className={styles.companyLine}>{siteConfig.company}</li>
            <li className={styles.companyLine}>{siteConfig.location}</li>
            <li>
              <a className={styles.link} href="mailto:contact@ssmasala.com">
                contact@ssmasala.com
              </a>
            </li>
            <li>
              <a
                className={styles.link}
                href="https://www.ssmasala.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.ssmasala.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          &copy; {year} {siteConfig.company}. All rights reserved.
        </p>
        <p>FSSAI licensed. Product of India.</p>
      </div>
    </footer>
  );
}
