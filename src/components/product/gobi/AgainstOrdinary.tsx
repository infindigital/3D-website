"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiComparison } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./AgainstOrdinary.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The owner's comparison sheet, set up as a match rather than a table.
 *
 * The feature runs down the middle on a single spine, this masala on one side
 * of it and an ordinary local masala on the other, and each pair closes in
 * from its own edge as the row arrives. It is still a table underneath — the
 * markup is a real one with row headers, and the grid is laid over it with
 * `display: contents` — because six features compared across two columns is
 * exactly what a table is for, whatever it ends up looking like.
 */
export default function AgainstOrdinary({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const enter = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 74%",
          toggleActions: "play none none reverse",
        },
      });

      enter.fromTo(
        `.${styles.eyebrow}`,
        { y: 18, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7 },
        0,
      );
      enter.fromTo(
        `.${styles.heading}`,
        { clipPath: "inset(0 0 100% 0)", y: 40 },
        { clipPath: "inset(0 0 -14% 0)", y: 0, duration: 1.1 },
        0.06,
      );
      enter.fromTo(
        `.${styles.lead}`,
        { y: 22, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.75 },
        0.26,
      );

      /* The spine draws down before anything is hung on it. */
      enter.fromTo(
        `.${styles.spine}`,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.9, ease: "power2.inOut", transformOrigin: "50% 0%" },
        0.3,
      );
      enter.fromTo(
        `.${styles.versus}`,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)" },
        0.42,
      );

      /* Each side comes in from its own edge, so the pair reads as two claims
         meeting at the feature between them. */
      enter.fromTo(
        `.${styles.ours}`,
        { x: -34, opacity: 0.001 },
        { x: 0, opacity: 1, duration: 0.7, stagger: 0.07 },
        0.5,
      );
      enter.fromTo(
        `.${styles.theirs}`,
        { x: 34, opacity: 0.001 },
        { x: 0, opacity: 0.72, duration: 0.7, stagger: 0.07 },
        0.56,
      );
      enter.fromTo(
        `.${styles.feature}`,
        { opacity: 0.001 },
        { opacity: 1, duration: 0.5, stagger: 0.07 },
        0.54,
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.against}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="How it compares"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>The difference</p>
          <h2 className={styles.heading}>Why settle for ordinary?</h2>
          <p className={styles.lead}>
            The restaurant-style version is a pack and a pan away. Here is what
            separates it from the masala sitting next to it on the shelf.
          </p>
        </header>

        <div className={styles.board}>
          <span className={styles.spine} aria-hidden="true" />

          <table className={styles.table}>
            <caption className={styles.caption}>
              {product.name} compared with other local masalas, feature by
              feature.
            </caption>
            <thead>
              <tr>
                <th scope="col" className={`${styles.colHead} ${styles.colOurs}`}>
                  <span className={styles.colBrand}>RS Chef&rsquo;z</span>
                  <span className={styles.colName}>Gobi Manchurian 3-in-1</span>
                </th>
                <th scope="col" className={styles.colVersus}>
                  <span className={styles.versus}>vs</span>
                </th>
                <th
                  scope="col"
                  className={`${styles.colHead} ${styles.colTheirs}`}
                >
                  <span className={styles.colBrand}>Other</span>
                  <span className={styles.colName}>local masalas</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {gobiComparison.map((row) => (
                <tr key={row.feature}>
                  <td className={styles.ours}>
                    <span className={styles.tick} aria-hidden="true" />
                    {row.ours}
                  </td>
                  <th scope="row" className={styles.feature}>
                    {row.feature}
                  </th>
                  <td className={styles.theirs}>
                    <span className={styles.cross} aria-hidden="true" />
                    {row.theirs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
