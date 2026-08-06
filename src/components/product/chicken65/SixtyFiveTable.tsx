"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { c65Assets, c65Range } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./SixtyFiveTable.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The rest of the table.
 *
 * The same sachet is a kabab, a fish fry and a gobi 65, and the owner shot all
 * four together — so this is one collage rather than four cards in a row: the
 * chicken large on the left because it is the dish the chapter is about, the
 * other three tucked around it at their own sizes.
 *
 * Nothing here sits still. Each tile drifts at its own rate as the page goes
 * by, which is what stops four photographs from reading as a contact sheet,
 * and each lifts and tips a little under the pointer. The lift is a hover, so
 * it never happens on a touch screen — where the note is simply always shown
 * instead of waiting behind one.
 */
export default function SixtyFiveTable({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = usePointerParallax<HTMLUListElement>();

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
        0.28,
      );

      /* The four come up in order, each turned slightly away and squaring
         itself off as it lands. */
      gsap.fromTo(
        `.${styles.tile}`,
        { y: 54, rotateY: -16, opacity: 0.001 },
        {
          y: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.grid}`,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /*
       * And then they drift, each at its own rate, for as long as the collage
       * is on screen. Written to a variable the hover lift and the pointer tip
       * also feed into, so the three never overwrite one another.
       */
      gsap.utils.toArray<HTMLElement>(`.${styles.tile}`).forEach((tile, i) => {
        const rate = [-34, 22, -16, 30][i % 4];
        gsap.fromTo(
          tile,
          { "--drift": `${-rate}px` },
          {
            "--drift": `${rate}px`,
            ease: "none",
            scrollTrigger: {
              trigger: `.${styles.grid}`,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.table}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="The rest of the table"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>One pack, four dinners</p>
          <h2 className={styles.heading}>
            It does not stop
            <br />
            at the chicken.
          </h2>
          <p className={styles.lead}>
            The same marinade, the same half hour, and whatever is in the
            fridge.
          </p>
        </header>

        <ul className={styles.grid} ref={gridRef}>
          {c65Range.map((dish, index) => (
            <li className={`${styles.tile} ${styles[dish.id]}`} key={dish.id}>
              <figure className={styles.card}>
                <div className={styles.art}>
                  <Image
                    src={c65Assets.dishes[dish.id]}
                    alt={`${dish.name} made with RS Chef'z 3 in 1 Masala`}
                    width={680}
                    height={545}
                    sizes={
                      index === 0
                        ? "(max-width: 720px) 92vw, (max-width: 1100px) 60vw, 50vw"
                        : "(max-width: 720px) 92vw, (max-width: 1100px) 40vw, 26vw"
                    }
                  />
                </div>
                <figcaption className={styles.label}>
                  <span className={styles.name}>{dish.name}</span>
                  <span className={styles.note}>{dish.note}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
