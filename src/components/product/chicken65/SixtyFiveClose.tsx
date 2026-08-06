"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BuyButtons from "@/components/ui/BuyButtons";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { c65Yield } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./SixtyFiveClose.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The end of the chapter, back at the pack it came out of.
 *
 * The pack itself is the one thing here that is not new: it is the same
 * owner-supplied artwork the hero flips and the blend section reads off, shown
 * the same way and gated on the same file check, and the two purchase buttons
 * are the site's own rather than a third pair invented for this chapter. All
 * this section adds is the last line of the story and somewhere to put it.
 */
export default function SixtyFiveClose({
  product,
  hasFront,
}: {
  product: Product;
  hasFront: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = usePointerParallax<HTMLDivElement>();

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
      enter.fromTo(
        `.${styles.pack}`,
        { y: 56, opacity: 0.001, "--enter-rz": "5deg" },
        {
          y: 0,
          opacity: 1,
          "--enter-rz": "0deg",
          duration: 1.2,
          ease: "power3.out",
        },
        0.12,
      );

      /* The pack rises a little as the band passes, so it is standing in the
         section rather than pasted onto it. */
      gsap.fromTo(
        `.${styles.pack}`,
        { "--float": "26px" },
        {
          "--float": "-26px",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
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
      <span className={styles.wash} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.heading}>
            One sachet,
            <br />
            and the fryer is on.
          </h2>
          <p className={styles.body}>
            {c65Yield.note} The same pack does the kabab, the fish and the gobi
            — which is the whole of what 3 in 1 means.
          </p>
          <BuyButtons
            className={styles.buys}
            whatsappMessage={product.whatsappMessage}
          />
        </div>

        {/* The pack as it is shown everywhere else on the site: the owner's own
            front artwork, file-gated, never redrawn for a section. */}
        {hasFront && (
          <div className={styles.stage} ref={stageRef}>
            <span className={styles.shade} aria-hidden="true" />
            <div className={styles.pack}>
              <Image
                className={styles.packImg}
                src={product.images.front}
                alt={`${product.name} pack, front`}
                width={900}
                height={1200}
                sizes="(max-width: 900px) 62vw, 34vw"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
