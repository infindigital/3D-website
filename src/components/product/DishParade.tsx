"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/config/products";
import styles from "./DishParade.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The dishes this pack cooks, as an oversized typographic parade. Each row
 * rises out of its own mask while its rule draws across, and the row's index
 * fades up beside it. Entrances reverse on scroll-back.
 */
export default function DishParade({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        `.${styles.eyebrow}`,
        { y: 18, opacity: 0.001 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`);
      for (const row of rows) {
        const tl = gsap.timeline({
          defaults: { ease: "power4.out" },
          scrollTrigger: {
            trigger: row,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        });
        tl.fromTo(
          row.querySelector(`.${styles.rule}`),
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "power3.inOut" },
          0,
        );
        tl.fromTo(
          row.querySelector(`.${styles.dishName}`),
          { yPercent: 115, rotate: 3 },
          { yPercent: 0, rotate: 0, duration: 0.9 },
          0.12,
        );
        tl.fromTo(
          row.querySelector(`.${styles.index}`),
          { y: 26, opacity: 0.001 },
          { y: 0, opacity: 1, duration: 0.7 },
          0.3,
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.parade}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label={`Dishes made with ${product.name}`}
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>One pack cooks</p>
        <ul className={styles.list}>
          {product.dishes.map((dish, index) => (
            <li key={dish} className={styles.row}>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.index}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.mask}>
                <span className={styles.dishName}>{dish}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
