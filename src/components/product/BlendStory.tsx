"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/config/products";
import styles from "./BlendStory.module.css";

gsap.registerPlugin(ScrollTrigger);

interface BlendStoryProps {
  product: Product;
  /** Whether the back-of-pack scan exists, checked server-side */
  hasBack: boolean;
}

/**
 * What is inside the pack and how much of it to use. Ingredient chips pop
 * in around the heading, the pack-to-food ratio lands as an oversized stat,
 * and the real back-of-pack scan drifts alongside at its own scroll depth.
 */
export default function BlendStory({ product, hasBack }: BlendStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const enter = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
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
        { clipPath: "inset(0 0 -12% 0)", y: 0, duration: 1.1 },
        0.08,
      );
      enter.fromTo(
        `.${styles.chip}`,
        { y: 24, opacity: 0.001, scale: 0.85 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          stagger: 0.07,
          ease: "back.out(1.7)",
        },
        0.35,
      );
      enter.fromTo(
        `.${styles.ratio}`,
        { y: 44, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.9 },
        0.55,
      );
      enter.fromTo(
        `.${styles.usage}`,
        { y: 24, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.7,
      );

      if (sectionRef.current?.querySelector(`.${styles.scanWrap}`)) {
        enter.fromTo(
          `.${styles.scanWrap}`,
          { y: 90, opacity: 0.001, rotate: 3 },
          { y: 0, opacity: 1, rotate: 1.6, duration: 1.2, ease: "power3.out" },
          0.2,
        );

        gsap.fromTo(
          `.${styles.scanDrift}`,
          { yPercent: 7 },
          {
            yPercent: -9,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.blend}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Inside the blend"
    >
      <div className={styles.inner}>
        <div className={styles.copyCol}>
          <p className={styles.eyebrow}>Inside the blend</p>
          <h2 className={styles.heading}>Only what the wok needs.</h2>
          <ul className={styles.chips} aria-label="Ingredients">
            {product.ingredients.map((ingredient) => (
              <li key={ingredient} className={styles.chip}>
                {ingredient}
              </li>
            ))}
          </ul>

          <div className={styles.ratio} role="group" aria-label="How much to use">
            <div className={styles.ratioSide}>
              <span className={styles.ratioValue}>{product.ratio.masala}</span>
              <span className={styles.ratioLabel}>of masala</span>
            </div>
            <span className={styles.ratioArrow} aria-hidden="true">
              &rarr;
            </span>
            <div className={styles.ratioSide}>
              <span className={styles.ratioValue}>{product.ratio.food}</span>
              <span className={styles.ratioLabel}>of food</span>
            </div>
          </div>
          <p className={styles.usage}>{product.usage}</p>
        </div>

        {hasBack && (
          <div className={styles.scanCol}>
            <div className={styles.scanDrift}>
              <figure className={styles.scanWrap}>
                <Image
                  className={styles.scanImg}
                  src={product.images.back}
                  alt={`${product.name} pack, back with full recipe`}
                  width={700}
                  height={850}
                  sizes="(max-width: 900px) 70vw, 380px"
                />
                <figcaption className={styles.scanCaption}>
                  Straight from the back of the pack
                </figcaption>
              </figure>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
