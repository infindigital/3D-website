import { gobiPromises } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./PromiseBanner.module.css";

/**
 * The six claims, running across the page directly under the hero.
 *
 * Two identical runs, so the strip can slide a whole run and start over
 * without the seam ever reaching the edge of the screen. It is decoration
 * rather than content — the same six things are said properly further down —
 * so the whole band is hidden from the reading order.
 */
export default function PromiseBanner({ product }: { product: Product }) {
  return (
    <div
      className={styles.banner}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {[0, 1].map((run) => (
          <ul className={styles.run} key={run}>
            {gobiPromises.map((promise) => (
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
