"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { c65Advantages, c65Assets } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./SixtyFiveEdge.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * What the pack is actually worth in a kitchen.
 *
 * The comparison above it argues with a photograph; this argues with four
 * plain sentences, so the work of holding a reader is done by the depth
 * instead. The four cards stand in their own room at four depths, each one
 * turned a little further off the page than the last, and the photograph
 * beside them tips under the pointer — the same summed-variable transform the
 * rest of the chapter uses, so the entrance, the scroll and the pointer never
 * overwrite one another.
 */
export default function SixtyFiveEdge({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const artRef = usePointerParallax<HTMLDivElement>();

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const enter = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 76%",
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
      /* The photograph is set down rather than faded in — small, turned, and
         settling — through the same variables the pointer drift feeds. */
      enter.fromTo(
        `.${styles.frame}`,
        { "--enter-s": 0.9, "--enter-rz": "-7deg", opacity: 0.001 },
        {
          "--enter-s": 1,
          "--enter-rz": "0deg",
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        },
        0.12,
      );
      /* Each card swings in on its own edge, in order, the way a hand would
         lay four cards down on a table. */
      enter.fromTo(
        `.${styles.card}`,
        { "--enter-y": "34px", "--enter-ry": "-22deg", opacity: 0.001 },
        {
          "--enter-y": "0px",
          "--enter-ry": "0deg",
          opacity: 1,
          duration: 0.9,
          stagger: 0.11,
          ease: "power3.out",
        },
        0.3,
      );

      const pass = {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      } as const;

      /* The photograph rises against the page as the section passes, which is
         what stops the column beside it reading as a flat list. */
      gsap.fromTo(
        `.${styles.frame}`,
        { "--drift": "34px" },
        { "--drift": "-34px", ease: "none", scrollTrigger: pass },
      );

      gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((el, i) => {
        const rate = [-24, 14, -16, 20][i % 4];
        gsap.fromTo(
          el,
          { "--drift": `${-rate}px` },
          { "--drift": `${rate}px`, ease: "none", scrollTrigger: pass },
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.edge}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Why one pack"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Why one pack</p>
            <h2 className={styles.heading}>
              What it saves you,
              <br />
              <span className={styles.marked}>every single fry</span>.
            </h2>
          </header>

          <ol className={styles.cards}>
            {c65Advantages.map((advantage) => (
              <li className={styles.card} key={advantage.id}>
                <article className={styles.cardFace}>
                  <span className={styles.index} aria-hidden="true">
                    {advantage.index}
                  </span>
                  <div className={styles.cardText}>
                    <h3 className={styles.cardTitle}>{advantage.title}</h3>
                    <p className={styles.cardBody}>{advantage.body}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>

        {/* The same masala off a grill rather than out of a pan — the one
            photograph on the page that says "and this too" without a word. */}
        <div className={styles.stage} ref={artRef}>
          <span className={styles.shade} aria-hidden="true" />
          <div className={styles.frame}>
            <Image
              className={styles.frameImg}
              src={c65Assets.tikka}
              alt="Chicken tikka on skewers, cooked from the same marinade over a grill"
              width={555}
              height={950}
              sizes="(max-width: 900px) 74vw, 34vw"
            />
            <span className={styles.frameTag}>
              Off the grill, same sachet
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
