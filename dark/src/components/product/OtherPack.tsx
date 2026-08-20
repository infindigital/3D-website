"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/config/products";
import styles from "./OtherPack.module.css";

gsap.registerPlugin(ScrollTrigger);

interface OtherPackProps {
  /** The other product in the lineup */
  product: Product;
  hasFront: boolean;
}

/**
 * Hands the reader to the other pack. The whole band is one link: its
 * name sweeps up out of a mask, the pack leans in from the side and keeps
 * drifting at its own depth while the band scrolls through.
 */
export default function OtherPack({ product, hasFront }: OtherPackProps) {
  const sectionRef = useRef<HTMLElement>(null);

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
        `.${styles.nameLine}`,
        { yPercent: 115, rotate: 3 },
        { yPercent: 0, rotate: 0, duration: 0.95, stagger: 0.09 },
        0.1,
      );
      enter.fromTo(
        `.${styles.cue}`,
        { y: 20, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.5,
      );

      if (sectionRef.current?.querySelector(`.${styles.packWrap}`)) {
        enter.fromTo(
          `.${styles.packWrap}`,
          { x: 70, opacity: 0.001, rotate: 6 },
          { x: 0, opacity: 1, rotate: 0, duration: 1.1, ease: "power3.out" },
          0.15,
        );

        gsap.fromTo(
          `.${styles.packDrift}`,
          { yPercent: 10 },
          {
            yPercent: -12,
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
      className={styles.band}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label={`Explore ${product.name}`}
    >
      <div className={styles.wash} aria-hidden="true" />
      <Link href={`/products/${product.slug}`} className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Also from RS Chef&rsquo;z</p>
          <p className={styles.name}>
            <span className={styles.mask}>
              <span className={styles.nameLine}>{product.name}</span>
            </span>
          </p>
          <p className={styles.cue}>
            {product.tagline}{" "}
            <span className={styles.arrow} aria-hidden="true">
              &rarr;
            </span>
          </p>
        </div>
        {hasFront && (
          <div className={styles.packDrift}>
            <div className={styles.packWrap}>
              <Image
                className={styles.packImg}
                src={product.images.front}
                alt={`${product.name} pack`}
                width={700}
                height={850}
                sizes="(max-width: 900px) 46vw, 300px"
              />
            </div>
          </div>
        )}
      </Link>
    </section>
  );
}
