import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/config/products";
import styles from "./not-found.module.css";

/**
 * Noindex, because a 404 is not a page anyone should arrive at from a search
 * result. Next serves it with a real 404 status, so this is belt and braces
 * rather than the only signal.
 */
export const metadata: Metadata = {
  title: { absolute: "Page not found | RS Chef'z" },
  robots: { index: false, follow: true },
};

/**
 * The 404.
 *
 * It offers the two product pages by name rather than only a way home: a
 * visitor who mistyped a product URL, and a crawler following a stale link,
 * both get a route back into the site that passes real link equity to the
 * pages that matter.
 */
export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.code}>404</p>
        <h1 className={styles.heading}>This page has left the kitchen.</h1>
        <p className={styles.body}>
          The link may be old, or the address mistyped. Everything RS
          Chef&rsquo;z makes is a click away below.
        </p>

        <ul className={styles.links}>
          <li>
            <Link className={styles.primary} href="/">
              Back to the home page
            </Link>
          </li>
          {products.map((product) => (
            <li key={product.slug}>
              <Link
                className={styles.link}
                href={`/products/${product.slug}`}
                style={
                  { "--accent": product.accentColor } as React.CSSProperties
                }
              >
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
