"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { c65Assets, c65Features, c65Yield } from "@/config/chicken65";
import type { C65Mark } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./SixtyFiveOpen.module.css";

/**
 * The four marks that sit beside the pack's four points, drawn rather than
 * cropped. The pack prints them as a picture; a picture of a word cannot be
 * read at any size, in any language, or out loud, so the words are text and
 * only the drawing is a graphic.
 */
const MARKS: Record<C65Mark, React.ReactNode> = {
  /* Three overlapping rings — one blend, three dishes */
  blend: (
    <>
      <circle cx="9" cy="9" r="5.4" />
      <circle cx="15" cy="9" r="5.4" />
      <circle cx="12" cy="14.5" r="5.4" />
    </>
  ),
  /* Arrows out of one centre — the same pack, four ways to cook it */
  versatile: (
    <>
      <path d="M12 3.6v16.8M3.6 12h16.8" />
      <path d="M12 3.6 9.6 6.4M12 3.6l2.4 2.8M12 20.4l-2.4-2.8M12 20.4l2.4-2.8" />
      <path d="M3.6 12l2.8-2.4M3.6 12l2.8 2.4M20.4 12l-2.8-2.4M20.4 12l-2.8 2.4" />
    </>
  ),
  /* Steam off something hot */
  taste: (
    <>
      <path d="M4.5 13.5h15a7.5 7.5 0 0 1-15 0Z" />
      <path d="M9 8.4c0-1.4 1.6-1.4 1.6-2.8M13.4 8.4c0-1.4 1.6-1.4 1.6-2.8" />
    </>
  ),
  /* A sealed pouch with a tick */
  sealed: (
    <>
      <path d="M6.4 5.2h11.2v13.6H6.4z" />
      <path d="M6.4 8h11.2" />
      <path d="m9.4 13.4 1.9 2 3.3-4" />
    </>
  ),
};

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
      /* The four points come in one at a time, each swinging out of the page
         on its own edge rather than sliding up — they are cards standing in
         front of the plate, so they arrive the way a card would. */
      enter.fromTo(
        `.${styles.point}`,
        { "--enter-y": "26px", "--enter-ry": "-24deg", opacity: 0.001 },
        {
          "--enter-y": "0px",
          "--enter-ry": "0deg",
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
        },
        0.34,
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
      const pass = {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      } as const;

      gsap.fromTo(
        `.${styles.plate}`,
        { "--turn": "-9deg" },
        { "--turn": "9deg", ease: "none", scrollTrigger: pass },
      );

      /* The four cards float past at their own rates, which is the whole of
         what stops a stack of four pills reading as a list. Written to its own
         variable so the entrance swing and the hover lift still land. */
      gsap.utils.toArray<HTMLElement>(`.${styles.point}`).forEach((el, i) => {
        const rate = [-26, 16, -18, 22][i % 4];
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
      className={styles.open}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Chicken 65"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
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

          {/* The four things printed across the front of the pack, standing as
              cards in front of it rather than lying under the heading as a
              list. Each one is stepped in from the last and floats at its own
              rate, so the column reads as four objects at four depths. */}
          <ul className={styles.points}>
            {c65Features.map((feature) => (
              <li className={styles.point} key={feature.id}>
                <span className={styles.pointCard}>
                  <span className={styles.pointText}>
                    <span className={styles.pointLabel}>{feature.label}</span>
                    <span className={styles.pointBody}>{feature.body}</span>
                  </span>
                  <span className={styles.pointMark} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      {MARKS[feature.mark]}
                    </svg>
                  </span>
                </span>
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
