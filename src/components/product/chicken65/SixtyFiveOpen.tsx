"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { c65Assets, c65Claims, c65Yield } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./SixtyFiveOpen.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The chapter opens on the plate itself.
 *
 * Everything in it was shot from directly overhead, so the one movement that
 * is true to the photograph is the plate turning on the table — rotation about
 * its own centre, scrubbed off the page's scroll — rather than the tip and
 * lean a picture taken from the side would want. The pointer adds the small
 * amount of tip that a plate on a table really does have when you lean over
 * it, and the disc of shade under it stays put while the plate moves, which is
 * what makes it read as an object standing on the page rather than a cut-out
 * stuck to it.
 */
export default function SixtyFiveOpen({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = usePointerParallax<HTMLDivElement>();

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
      enter.fromTo(
        `.${styles.claim}`,
        { y: 24, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.09 },
        0.36,
      );

      /* The plate is set down rather than faded in: it arrives small and a
         little turned, and settles. Written through the variables the pointer
         drift also feeds, so the two never overwrite each other. */
      enter.fromTo(
        `.${styles.plate}`,
        { "--enter-s": 0.86, "--enter-rz": "-16deg", opacity: 0.001 },
        {
          "--enter-s": 1,
          "--enter-rz": "0deg",
          opacity: 1,
          duration: 1.3,
          ease: "power3.out",
        },
        0.1,
      );
      enter.fromTo(
        `.${styles.shade}`,
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" },
        0.22,
      );

      /* And then it keeps turning, slowly, for as long as the section is on
         screen — a quarter of a turn across the whole panel, which is under a
         degree per scrolled percent and reads as drift rather than as spin. */
      gsap.fromTo(
        `.${styles.plate}`,
        { "--turn": "-9deg" },
        {
          "--turn": "9deg",
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
      className={styles.open}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Chicken 65"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>The same pack, one dish at a time</p>
          <h2 className={styles.heading}>
            Chicken 65,
            <br />
            out of <span className={styles.marked}>one sachet</span>.
          </h2>
          <p className={styles.lead}>
            No chilli to measure, no colour to add and no second masala to open.
            {" "}
            {c65Yield.note}
          </p>

          <ul className={styles.claims}>
            {c65Claims.map((claim) => (
              <li className={styles.claim} key={claim.label}>
                <span className={styles.claimLabel}>{claim.label}</span>
                <span className={styles.claimBody}>{claim.body}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.stage} ref={stageRef}>
          {/* The shade the plate throws. It is a separate element from the
              plate so it can stay still while the plate turns above it —
              a shadow that rotates with its object is a sticker, not a
              shadow. */}
          <span className={styles.shade} aria-hidden="true" />
          <div className={styles.plate}>
            <Image
              className={styles.plateImg}
              src={c65Assets.plates.ours}
              alt="A plate of Chicken 65 cooked with RS Chef'z 3 in 1 Masala, with onion rings, curry leaf and lime"
              width={1100}
              height={1100}
              sizes="(max-width: 900px) 82vw, 46vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
