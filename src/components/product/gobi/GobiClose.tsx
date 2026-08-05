"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BuyButtons from "@/components/ui/BuyButtons";
import { gobiAssets } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./GobiClose.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The last word: the same pack works at both ends of the trade.
 *
 * It closes on the spread rather than on the pack, because what is being
 * bought is the table and not the packet, and it hands the two site-wide
 * purchase buttons over rather than inventing a third pair.
 */
export default function GobiClose({ product }: { product: Product }) {
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
        `.${styles.heading}`,
        { clipPath: "inset(0 0 100% 0)", y: 40 },
        { clipPath: "inset(0 0 -14% 0)", y: 0, duration: 1.1 },
        0,
      );
      enter.fromTo(
        [`.${styles.body}`, `.${styles.buys}`],
        { y: 24, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
        0.28,
      );

      /* The picture keeps moving after the words have landed, at its own
         pace, so the band has depth while it is scrolled through. */
      gsap.fromTo(
        `.${styles.shotImg}`,
        { yPercent: -6, scale: 1.08 },
        {
          yPercent: 6,
          scale: 1.08,
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.close}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label={`Order ${product.name}`}
    >
      <div className={styles.inner}>
        <div className={styles.shot}>
          <Image
            className={styles.shotImg}
            src={gobiAssets.spread}
            alt="A spread of Gobi Manchurian served three ways"
            width={1600}
            height={1067}
            sizes="(max-width: 900px) 100vw, 52vw"
          />
        </div>

        <div className={styles.copy}>
          <h2 className={styles.heading}>
            For your kitchen,
            <br />
            or your kitchen&rsquo;s kitchen.
          </h2>
          <p className={styles.body}>
            One evening&rsquo;s snack out of a 30 g sachet, or a night&rsquo;s
            service out of the 5 kg sack — the crunch, the colour and the
            quantity of masala per plate come out the same either way.
          </p>
          <BuyButtons
            className={styles.buys}
            whatsappMessage={product.whatsappMessage}
          />
        </div>
      </div>
    </section>
  );
}
