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
 * Six ticked lines against one photograph, and nothing else. The reasons used
 * to be cards with a sentence apiece, which is the same six reasons written as
 * six paragraphs — a reader skimming for what a pack does reads bullets or
 * reads nothing. The depth is all in the movement instead: the photograph tips
 * under the pointer and rises against the page, and the lines swing in one at
 * a time on their own edge, through the summed-variable transform the rest of
 * the chapter uses so entrance, scroll and pointer never overwrite each other.
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
        { "--enter-s": 0.9, "--enter-rz": "-5deg", opacity: 0.001 },
        {
          "--enter-s": 1,
          "--enter-rz": "0deg",
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        },
        0.1,
      );
      /* One line at a time, each swinging in off its own left edge, the way a
         hand ticks down a list. */
      enter.fromTo(
        `.${styles.item}`,
        { "--enter-x": "-26px", "--enter-ry": "-18deg", opacity: 0.001 },
        {
          "--enter-x": "0px",
          "--enter-ry": "0deg",
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
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

      /* The photograph and the list cross the page at different rates, which is
         the whole of what keeps two columns from reading as one slab. The list
         moves as one piece: its lines are ruled off each other, and six rules
         drifting apart would read as a table coming apart. */
      gsap.fromTo(
        `.${styles.frame}`,
        { "--drift": "30px" },
        { "--drift": "-30px", ease: "none", scrollTrigger: pass },
      );
      gsap.fromTo(
        `.${styles.list}`,
        { "--drift": "-14px" },
        { "--drift": "14px", ease: "none", scrollTrigger: pass },
      );
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
        {/* The three plates the one pack makes, in one frame — the argument for
            it, made before a word of the list is read. */}
        <div className={styles.stage} ref={artRef}>
          <span className={styles.shade} aria-hidden="true" />
          <div className={styles.frame}>
            <Image
              className={styles.frameImg}
              src={c65Assets.spread}
              alt="Chicken 65, seekh kababs and fish fry plated together, all made with the one 3 in 1 Masala"
              width={1400}
              height={933}
              sizes="(max-width: 900px) 90vw, 48vw"
            />
            <span className={styles.frameTag}>One pack, three plates</span>
          </div>
        </div>

        <div className={styles.copy}>
          <header>
            <p className={styles.eyebrow}>Why one pack</p>
            <h2 className={styles.heading}>
              What it saves you,{" "}
              <span className={styles.marked}>every single fry</span>.
            </h2>
          </header>

          <ul className={styles.list}>
            {c65Advantages.map((advantage) => (
              <li className={styles.item} key={advantage.id}>
                <span className={styles.tick} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="m6 12.4 4 4 8-8.8" />
                  </svg>
                </span>
                <span className={styles.itemText}>{advantage.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
