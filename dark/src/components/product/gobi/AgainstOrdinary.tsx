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
 * of it and an ordinary local masala on the other. The two are not level: the
 * board is a real perspective and the pair leans out of it like an open book,
 * ours toward the reader and theirs set back — so the argument is made by
 * where the two sides stand before a word of it is read.
 *
 * Rows arrive one at a time on their own feature rather than all together on
 * the section, and the tally at the foot counts them off as they land. It is
 * still a table underneath — a real one with row headers, laid out as a grid
 * with `display: contents` — because six features compared across two columns
 * is exactly what a table is for, whatever it ends up looking like.
 */
export default function AgainstOrdinary({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tallyRef = useRef<HTMLSpanElement>(null);

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

      /*
       * A row at a time, each on its own feature. The two sides slide in from
       * their own edges through a variable rather than through `x`, because the
       * lean out of the board is a transform on the same element and an inline
       * one from GSAP would simply replace it.
       */
      const rows = gsap.utils.toArray<HTMLTableRowElement>(
        `.${styles.table} tbody tr`,
      );

      const tally = tallyRef.current;
      const setTally = (n: number) => {
        if (tally) tally.textContent = String(n);
      };
      setTally(0);

      rows.forEach((row, index) => {
        const feature = row.querySelector(`.${styles.feature}`);
        const ours = row.querySelector(`.${styles.ours}`);
        const theirs = row.querySelector(`.${styles.theirs}`);
        if (!feature || !ours || !theirs) return;

        const arrive = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: feature,
            start: "top 88%",
            toggleActions: "play none none reverse",
            onEnter: () => setTally(index + 1),
            onLeaveBack: () => setTally(index),
          },
        });

        arrive.fromTo(
          feature,
          { opacity: 0.001 },
          { opacity: 1, duration: 0.45 },
          0,
        );
        arrive.fromTo(
          ours,
          { "--enter-x": "-38px", opacity: 0.001 },
          { "--enter-x": "0px", opacity: 1, duration: 0.7 },
          0.04,
        );
        arrive.fromTo(
          theirs,
          { "--enter-x": "38px", opacity: 0.001 },
          { "--enter-x": "0px", opacity: 0.72, duration: 0.7 },
          0.1,
        );
      });

      /* The count is written straight into the node, so putting it back is
         this branch's own job — reverting a timeline cannot undo it. */
      return () => setTally(gobiComparison.length);
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
            What separates it from the masala sitting beside it on the shelf.
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

          {/*
            The count of rows that have landed. It reads as a score because
            that is what the sheet is — six things put side by side, and the
            same side answering all six.
          */}
          <p className={styles.tally}>
            <span className={styles.tallyNum} ref={tallyRef}>
              {gobiComparison.length}
            </span>
            <span className={styles.tallyOf}>
              of {gobiComparison.length} answered by the pack, not the cook
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
