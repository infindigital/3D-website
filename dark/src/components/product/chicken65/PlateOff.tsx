"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { c65Assets, c65Points } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./PlateOff.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The two plates, held side by side while the reading of them goes past.
 *
 * The owner shot both dishes on the same white, from the same height, on the
 * same day — which is the whole argument, and it only lands if the two are on
 * screen together for long enough to be looked at. So the pair is held while
 * the three readings pass underneath, one at a time, rather than three cards
 * scrolling by with a plate stuck to each.
 *
 * Both photographs are top-down, so the honest movement is a plate turning on
 * the table — rotation about its own centre — and not the tip a picture taken
 * from the side would want. The shade under each is a separate element so it
 * stays put while the plate turns above it: a shadow that rotates with its
 * object is a sticker, not a shadow.
 *
 * There is no "VS" anywhere in it. The two plates are the comparison; a badge
 * between them would only be the page shouting what the photographs say.
 */
export default function PlateOff({ product }: { product: Product }) {
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
    });

    /*
     * The holding, the turning and the reading are all one movement, and all
     * of it is desktop-and-tablet only. On a phone the pair does not fit
     * beside each other at a size worth looking at, so there the section is
     * simply the two plates and the three readings, in order, unheld.
     */
    mm.add(
      "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
      () => {
        const points = gsap.utils.toArray<HTMLElement>(`.${styles.point}`);
        const beads = gsap.utils.toArray<HTMLElement>(`.${styles.bead}`);
        if (!points.length) return;

        const show = (index: number) => {
          points.forEach((el, i) => el.classList.toggle(styles.live, i === index));
          beads.forEach((el, i) => el.classList.toggle(styles.beadOn, i === index));
        };
        show(0);

        const reading = ScrollTrigger.create({
          trigger: `.${styles.track}`,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            /* The last reading gets the tail of the track to itself rather
               than a slice the width of a rounding error. */
            const index = Math.min(
              points.length - 1,
              Math.floor(self.progress * points.length),
            );
            show(index);
          },
        });

        /* The plates turn against each other as the track passes, so the pair
           is never quite symmetrical and never quite still. */
        const travel = {
          trigger: `.${styles.track}`,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        } as const;

        gsap.fromTo(
          `.${styles.ours}`,
          { "--turn": "-7deg" },
          { "--turn": "6deg", ease: "none", scrollTrigger: travel },
        );
        gsap.fromTo(
          `.${styles.other}`,
          { "--turn": "6deg" },
          { "--turn": "-5deg", ease: "none", scrollTrigger: travel },
        );

        /* And the light comes up on our side as the case is made — the shade
           under our plate deepening and its glow warming, while the other
           stays exactly as it was photographed. */
        gsap.fromTo(
          `.${styles.stage}`,
          { "--lit": 0 },
          { "--lit": 1, ease: "none", scrollTrigger: travel },
        );

        return () => reading.kill();
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.off}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Compared with an ordinary masala"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Side by side</p>
          <h2 className={styles.heading}>
            Two plates,
            <br />
            one afternoon.
          </h2>
          <p className={styles.lead}>
            The same cut of chicken, the same oil and the same pan. One coated
            with our 3 in 1 Masala, the other with an ordinary one.
          </p>
        </header>
      </div>

      {/* The track is the scroll the holding uses up. It is given a height in
          screens rather than pinned by GSAP, so the browser does the holding
          itself and there is nothing to fight the page's smooth scrolling. */}
      <div className={styles.track}>
        <div className={styles.pin}>
          <div className={styles.stage} ref={stageRef}>
            {/* The plate turns; its shade and its label do not. So the disc is
                its own element inside the figure and the other two sit beside
                it — a shadow that rolls with its object is a sticker, and a
                label that rolls with it is a label on a wheel. */}
            <figure className={`${styles.plate} ${styles.ours}`}>
              <span className={styles.shade} aria-hidden="true" />
              <span className={styles.glow} aria-hidden="true" />
              <div className={styles.disc}>
                <Image
                  className={styles.plateImg}
                  src={c65Assets.plates.ours}
                  alt="Chicken 65 cooked with RS Chef'z 3 in 1 Masala — evenly red, with onion, curry leaf and lime"
                  width={1100}
                  height={1100}
                  sizes="(max-width: 760px) 78vw, 38vw"
                />
              </div>
              <figcaption className={styles.name}>
                <span className={styles.nameMark}>Ours</span>
                RS Chef’z 3 in 1
              </figcaption>
            </figure>

            <figure className={`${styles.plate} ${styles.other}`}>
              <span className={styles.shade} aria-hidden="true" />
              <div className={styles.disc}>
                <Image
                  className={styles.plateImg}
                  src={c65Assets.plates.other}
                  alt="Chicken 65 cooked with an ordinary masala — patchy brown, served dry with a chutney"
                  width={1100}
                  height={1100}
                  sizes="(max-width: 760px) 78vw, 38vw"
                />
              </div>
              <figcaption className={styles.name}>
                <span className={`${styles.nameMark} ${styles.nameMarkPlain}`}>
                  Theirs
                </span>
                Another masala
              </figcaption>
            </figure>
          </div>

          <div className={styles.readout}>
            <ol className={styles.points}>
              {c65Points.map((point) => (
                <li className={styles.point} key={point.feature}>
                  <h3 className={styles.feature}>{point.feature}</h3>
                  <div className={styles.sides}>
                    <p className={`${styles.side} ${styles.sideOurs}`}>
                      {point.ours}
                    </p>
                    <p className={styles.side}>{point.theirs}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className={styles.beads} aria-hidden="true">
              {c65Points.map((point) => (
                <span className={styles.bead} key={point.feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
