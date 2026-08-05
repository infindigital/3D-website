"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiBlend } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./BlendMakeup.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * What is actually in the pack.
 *
 * Six things, hung either side of the pack on the owner's own dashed leads —
 * three to the left, three to the right, each line running straight in to the
 * pack it came out of. The colour on each is the spice's, which is the point
 * of the seal in the corner: everything red on this page is chilli.
 */
export default function BlendMakeup({ product }: { product: Product }) {
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
        `.${styles.pack}`,
        { y: 46, opacity: 0.001, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" },
        0.18,
      );
      enter.fromTo(
        `.${styles.seal}`,
        { scale: 0.4, rotate: -24, opacity: 0 },
        { scale: 1, rotate: -9, opacity: 1, duration: 0.8, ease: "back.out(1.8)" },
        0.62,
      );

      /* The leads run out from the pack, so the parts on them arrive from the
         middle rather than from the edge of the screen. */
      enter.fromTo(
        `.${styles.left} .${styles.part}`,
        { x: 40, opacity: 0.001 },
        { x: 0, opacity: 1, duration: 0.72, stagger: 0.09 },
        0.42,
      );
      enter.fromTo(
        `.${styles.right} .${styles.part}`,
        { x: -40, opacity: 0.001 },
        { x: 0, opacity: 1, duration: 0.72, stagger: 0.09 },
        0.42,
      );
    });

    return () => mm.revert();
  }, []);

  const left = gobiBlend.slice(0, 3);
  const right = gobiBlend.slice(3);

  return (
    <section
      ref={sectionRef}
      className={styles.makeup}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="What is in the pack"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Ingredients</p>
          <h2 className={styles.heading}>
            Six things.
            <br />
            None of them a colour.
          </h2>
        </header>

        <div className={styles.board}>
          <ul className={`${styles.column} ${styles.left}`}>
            {left.map((part) => (
              <li
                className={styles.part}
                key={part.name}
                style={{ "--tone": part.tone } as React.CSSProperties}
              >
                <span className={styles.disc} aria-hidden="true" />
                <span className={styles.partBody}>
                  <span className={styles.partName}>{part.name}</span>
                  <span className={styles.partRole}>{part.role}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.stage}>
            <div className={styles.pack}>
              <Image
                className={styles.packImg}
                src={product.images.front}
                alt={`${product.name} pack`}
                width={620}
                height={800}
                sizes="(max-width: 860px) 56vw, 300px"
              />
            </div>

            {/* The seal from the owner's sheet, redrawn: a brush struck
                through, because the claim is about what is not in there. */}
            <div className={styles.seal}>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path
                  d="M15 33 L27 21 M27 21 l4-4 a3 3 0 0 1 4 4 l-4 4 M27 21 l4 4 M13 35 l-2 4 4-2"
                  fill="none"
                />
                <line x1="10" y1="38" x2="38" y2="10" />
              </svg>
              <span>
                No artificial
                <br />
                colour
              </span>
            </div>
          </div>

          <ul className={`${styles.column} ${styles.right}`}>
            {right.map((part) => (
              <li
                className={styles.part}
                key={part.name}
                style={{ "--tone": part.tone } as React.CSSProperties}
              >
                <span className={styles.disc} aria-hidden="true" />
                <span className={styles.partBody}>
                  <span className={styles.partName}>{part.name}</span>
                  <span className={styles.partRole}>{part.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
