import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export interface Crumb {
  name: string;
  path: string;
}

/**
 * The visible trail.
 *
 * It takes the same array the BreadcrumbList JSON-LD is built from, so the
 * markup and the structured data cannot describe two different trails —
 * which is the one thing Google checks a breadcrumb for.
 *
 * There is no /products index route on this site, so the middle step is
 * rendered as plain text rather than as a link to a 404. A crumb only
 * becomes a link when it has somewhere real to go.
 */
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const linkable = !isLast && crumb.path !== "/products";

          return (
            <li
              className={`${styles.item} ${isLast ? styles.current : ""}`}
              key={crumb.path}
            >
              {linkable ? (
                <Link className={styles.link} href={crumb.path}>
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {crumb.name}
                </span>
              )}
              {!isLast && (
                <span className={styles.sep} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
