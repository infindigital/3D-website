"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/config/products";
import styles from "./FlavourScene.module.css";

gsap.registerPlugin(ScrollTrigger);

interface FlavourSceneProps {
  product: Product;
  /** Mirrors the layout so back to back scenes alternate sides */
  flip?: boolean;
  /** Whether the front artwork file exists, checked server-side */
  hasFront: boolean;
}

/**
 * One scroll scene per product. The pack drifts slower than the copy as the
 * scene passes, an accent wash breathes behind it, the headline wipes in
 * from a clip mask and the dish chips deal themselves in. Entrances reverse
 * on scroll-back so the scene replays both ways.
 */
export default function FlavourScene({
  product,
  flip = false,
  hasFront,
}: FlavourSceneProps) {
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
        `.${styles.title}`,
        { clipPath: "inset(0 0 100% 0)", y: 40 },
        { clipPath: "inset(0 0 -12% 0)", y: 0, duration: 1.1 },
        0,
      );
      enter.fromTo(
        [`.${styles.tagline}`, `.${styles.description}`],
        { y: 34, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
        0.2,
      );
      enter.fromTo(
        `.${styles.chip}`,
        { y: 22, opacity: 0.001, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 },
        0.45,
      );
      enter.fromTo(
        `.${styles.explore}`,
        { y: 22, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.6,
      );

      if (sectionRef.current?.querySelector(`.${styles.packWrap}`)) {
        enter.fromTo(
          `.${styles.packWrap}`,
          { y: 110, opacity: 0.001, rotate: flip ? 7 : -7 },
          { y: 0, opacity: 1, rotate: 0, duration: 1.3, ease: "power3.out" },
          0.1,
        );

        // Depth pass: the pack travels slower than the page while in view
        gsap.fromTo(
          `.${styles.packDrift}`,
          { yPercent: 9 },
          {
            yPercent: -13,
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

      gsap.fromTo(
        `.${styles.wash}`,
        { scale: 0.85, opacity: 0.55 },
        {
          scale: 1.12,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    return () => mm.revert();
  }, [flip]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.scene} ${flip ? styles.flip : ""}`}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label={product.name}
    >
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.inner}>
        {hasFront && (
          <div className={styles.packCol}>
            <div className={styles.packDrift}>
              <Link
                href={`/products/${product.slug}`}
                className={styles.packWrap}
                aria-label={`Explore ${product.name}`}
              >
                <Image
                  className={styles.packImg}
                  src={product.images.front}
                  alt={`${product.name} pack`}
                  width={700}
                  height={850}
                  sizes="(max-width: 900px) 62vw, 420px"
                />
              </Link>
            </div>
          </div>
        )}

        <div className={styles.copyCol}>
          <h2 className={styles.title}>{product.name}</h2>
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.description}>{product.description}</p>
          <ul className={styles.chips} aria-label="Signature dishes">
            {product.dishes.map((dish) => (
              <li key={dish} className={styles.chip}>
                {dish}
              </li>
            ))}
          </ul>
          <Link href={`/products/${product.slug}`} className={styles.explore}>
            Explore the pack
            <span aria-hidden="true" className={styles.exploreArrow}>
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
