import { gobiPromises } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./PromiseBanner.module.css";

interface PromiseBannerProps {
  product: Product;
  /** The claims to run. Defaults to Gobi's, which is where the band began. */
  items?: readonly string[];
}

/**
 * The claims, running across the page directly under the hero.
 *
 * Two identical runs, so the strip can slide a whole run and start over
 * without the seam ever reaching the edge of the screen. It is decoration
 * rather than content — the same things are said properly further down —
 * so the whole band is hidden from the reading order.
 *
 * The list is a prop because the band is the same idea on every product page
 * and only the words change; one strip taking its lines from the page that
 * mounts it beats two strips to keep in step.
 */
export default function PromiseBanner({
  product,
  items = gobiPromises,
}: PromiseBannerProps) {
  return (
    <div
      className={styles.banner}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {[0, 1].map((run) => (
          <ul className={styles.run} key={run}>
            {items.map((promise) => (
              <li key={promise} className={styles.promise}>
                {promise}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
