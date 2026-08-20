"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { c65Assets, c65Steps, c65Yield } from "@/config/chicken65";
import type { Product } from "@/config/products";
import styles from "./SixtyFiveFilm.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The recipe, told against the film rather than beside it.
 *
 * The film is the one thing held still: it sticks in its column and keeps
 * playing while the three steps pass it, so the reader is always looking at
 * the pan while reading what to do to it. The steps light up one at a time as
 * they reach the middle of the screen, and a thread down their left fills as
 * they go — the section's own progress, rather than a number in a corner.
 *
 * The steps themselves are the preparation panel printed on the back of the
 * pack, transcribed. The panel is a photograph of type, which is the one kind
 * of image worth turning back into text: it can then be read at any size, in
 * any language the browser offers, and out loud.
 *
 * The film is muted, looping and gated on visibility, for the same reason as
 * every other film on the site — a decoder running for a section nobody is
 * looking at is a section further down the page dropping frames.
 */
export default function SixtyFiveFilm({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* React writes `muted` as an attribute, which an element already in the
       document ignores — and without the property autoplay is refused. */
    video.muted = true;

    const play = () => void video.play().catch(() => {});
    let onScreen = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.intersectionRatio > 0.25;
        if (onScreen) play();
        else video.pause();
      },
      { threshold: [0, 0.25, 0.6] },
    );
    observer.observe(video);

    const resume = () => {
      if (onScreen && !document.hidden && video.paused) play();
    };
    document.addEventListener("visibilitychange", resume);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

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
        `.${styles.frame}`,
        { y: 64, opacity: 0.001, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.14,
      );

      /*
       * Each step lights as it reaches the middle of the screen and goes back
       * down as it leaves, so exactly one of the three is ever lit while the
       * film is held. The class is toggled rather than tweened because what
       * changes is a set of colours and a rule, not a transform.
       */
      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`);
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          end: "bottom 42%",
          toggleClass: { targets: step, className: styles.live },
        });
      });

      gsap.fromTo(
        `.${styles.step}`,
        { y: 34, opacity: 0.001 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.steps}`,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /* The thread down the left of the steps, drawn as they pass. Scaled from
         the top rather than clipped: it is a plain rule with nothing in it. */
      gsap.fromTo(
        `.${styles.threadFill}`,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: `.${styles.steps}`,
            start: "top 66%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        },
      );
    });

    /* The film leans as the page passes it, and the light runs over the glass.
       Only where it is standing beside the steps: below that break it is
       stacked in its own column and already facing the reader. */
    mm.add(
      "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
      () => {
        const travel = {
          trigger: `.${styles.stage}`,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.9,
        } as const;

        gsap.fromTo(
          `.${styles.frame}`,
          { rotationY: 9, rotationX: 3 },
          { rotationY: -7, rotationX: -2.5, ease: "none", scrollTrigger: travel },
        );
        gsap.fromTo(
          `.${styles.sheen}`,
          { xPercent: -80 },
          { xPercent: 80, ease: "none", scrollTrigger: travel },
        );
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.film}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Cooking Chicken 65"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Cook it</p>
          <h2 className={styles.heading}>
            Mix, coat,
            <br />
            and fry it hot.
          </h2>
          <p className={styles.lead}>
            The whole method is printed on the back of the pack, and it is three
            things long. {c65Yield.sachet} of masala to {c65Yield.chicken} of
            cleaned chicken, and half an hour of that is the marinade’s, not
            yours.
          </p>
        </header>

        <div className={styles.stage}>
          {/* The film's column. The sticky element is the column's inner
              wrapper rather than the frame itself, so the frame keeps its own
              transform for the lean and the sticking is never fighting it. */}
          <div className={styles.filmCol}>
            <div className={styles.filmStick}>
              <div className={styles.frame}>
                <video
                  ref={videoRef}
                  className={styles.video}
                  src={c65Assets.film}
                  poster={c65Assets.filmPoster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`Cooking Chicken 65 with ${product.name}`}
                />
                <span className={styles.sheen} aria-hidden="true" />
                <span className={styles.tag}>Sachet to plate</span>
              </div>
            </div>
          </div>

          <ol className={styles.steps}>
            {/* The thread the steps hang off. Two elements: the faint full
                length, and the accent that fills along it as the page goes. */}
            <span className={styles.thread} aria-hidden="true">
              <span className={styles.threadFill} />
            </span>

            {c65Steps.map((step, index) => (
              <li className={styles.step} key={step.id}>
                <span className={styles.dot} aria-hidden="true" />
                <p className={styles.cue}>{step.cue}</p>
                <h3 className={styles.stepTitle}>
                  <span className={styles.stepIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step.title}
                </h3>
                <p className={styles.stepText}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
