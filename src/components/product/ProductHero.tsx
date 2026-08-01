"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/config/products";
import { supportsWebGL } from "@/utils/webgl";
import BuyButtons from "@/components/ui/BuyButtons";
import styles from "./ProductHero.module.css";

gsap.registerPlugin(ScrollTrigger);

const PackFlipCanvas = dynamic(() => import("@/three/PackFlipCanvas"), {
  ssr: false,
});

interface ProductHeroProps {
  product: Product;
  /** Whether the artwork files exist, checked server-side */
  hasFront: boolean;
  hasBack: boolean;
}

/**
 * The product page opener. The copy raises out of word masks while the real
 * sachet floats beside it, then the section pins and the scroll itself turns
 * the pack over to the recipe side. Without WebGL the same turn happens as a
 * CSS flip of the flat scans, and reduced motion gets a static layout.
 */
export default function ProductHero({
  product,
  hasFront,
  hasBack,
}: ProductHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const flipperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShow3D(supportsWebGL() && !reduced.matches);
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    // The pin only happens on screens where the whole hero fits; small
    // screens scrub the same flip as the section scrolls past instead.
    mm.add(
      {
        pinned: "(prefers-reduced-motion: no-preference) and (min-width: 901px)",
        compact: "(prefers-reduced-motion: no-preference) and (max-width: 900px)",
      },
      (context) => {
      const pinned = Boolean(
        (context.conditions as { pinned?: boolean }).pinned,
      );
      const enter = gsap.timeline({ defaults: { ease: "power4.out" } });

      enter.fromTo(
        `.${styles.kicker}`,
        { y: 18, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.05,
      );
      enter.fromTo(
        `.${styles.titleWord}`,
        { yPercent: 120, rotate: 5 },
        { yPercent: 0, rotate: 0, duration: 0.95, stagger: 0.07 },
        0.12,
      );
      enter.fromTo(
        [`.${styles.tagline}`, `.${styles.description}`],
        { y: 30, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.12 },
        0.4,
      );
      enter.fromTo(
        `.${styles.ctas}`,
        { y: 24, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.62,
      );

      if (hasFront) {
        enter.fromTo(
          `.${styles.packSide}`,
          { y: 90, opacity: 0.001 },
          { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
          0.25,
        );

        const flip = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            scrub: 0.5,
            ...(pinned
              ? { start: "top top", end: "+=160%", pin: true }
              : // The hero already sits at the top of the page, so the flip
                // must begin at zero and finish while the pack is on screen
                { start: "top top", end: "+=90%" }),
            onUpdate: (self) => {
              progressRef.current = self.progress;
            },
          },
        });

        if (flipperRef.current) {
          flip.fromTo(
            flipperRef.current,
            { rotationY: 0 },
            { rotationY: 180, ease: "none", duration: 1 },
            0,
          );
        } else {
          // The 3D rig reads progressRef, the timeline only needs length
          flip.to({}, { duration: 1 }, 0);
        }

        flip.to(
          `.${styles.captionFront}`,
          { opacity: 0, yPercent: -60, duration: 0.16, ease: "none" },
          0.4,
        );
        flip.fromTo(
          `.${styles.captionBack}`,
          { opacity: 0, yPercent: 60 },
          { opacity: 1, yPercent: 0, duration: 0.16, ease: "none" },
          0.5,
        );
        flip.fromTo(
          `.${styles.wash}`,
          { scale: 0.9, opacity: 0.6 },
          { scale: 1.15, opacity: 1, duration: 1, ease: "none" },
          0,
        );
      }
      },
    );

    return () => mm.revert();
  }, [hasFront, show3D]);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label={product.name}
    >
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            RS Chef&rsquo;z <span aria-hidden="true">&middot;</span>{" "}
            {product.shortName}
          </p>
          <h1 className={styles.title}>
            {product.name.split(" ").map((word, index) => (
              <span className={styles.mask} key={`${word}-${index}`}>
                <span className={styles.titleWord}>{word}</span>
              </span>
            ))}
          </h1>
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.description}>{product.description}</p>
          <BuyButtons
            whatsappMessage={product.whatsappMessage}
            className={styles.ctas}
          />
        </div>

        {hasFront && (
          <div className={styles.packSide}>
            {show3D ? (
              <div className={styles.canvasWrap}>
                <PackFlipCanvas
                  front={product.images.front}
                  back={hasBack ? product.images.back : undefined}
                  accent={product.accentColor}
                  progress={progressRef}
                />
              </div>
            ) : (
              <div className={styles.flipScene}>
                <div ref={flipperRef} className={styles.flipper}>
                  <Image
                    className={styles.face}
                    src={product.images.front}
                    alt={`${product.name} pack, front`}
                    width={700}
                    height={850}
                    priority
                    sizes="(max-width: 900px) 64vw, 400px"
                  />
                  <Image
                    className={`${styles.face} ${styles.faceBack}`}
                    src={hasBack ? product.images.back : product.images.front}
                    alt={`${product.name} pack, back`}
                    width={700}
                    height={850}
                    sizes="(max-width: 900px) 64vw, 400px"
                  />
                </div>
              </div>
            )}
            <div className={styles.captions}>
              <p className={styles.captionFront}>
                Keep scrolling, the pack turns over.
              </p>
              <p className={styles.captionBack}>
                The recipe lives on the back.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
