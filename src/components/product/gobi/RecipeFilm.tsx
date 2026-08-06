"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiAssets, gobiRecipe } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./RecipeFilm.module.css";

gsap.registerPlugin(ScrollTrigger);

/** The forty-five minutes, for the bar and for the line above it */
const totalMinutes = gobiRecipe.timeline.reduce(
  (sum, span) => sum + span.minutes,
  0,
);
const waitingMinutes = gobiRecipe.timeline
  .filter((span) => span.kind === "wait")
  .reduce((sum, span) => sum + span.minutes, 0);

/**
 * The recipe, led by the clock rather than by the pictures.
 *
 * The heading claims most of the cooking is waiting, so the section proves it
 * before it explains anything: one bar drawn to scale, the marinade twice the
 * length of the pan, with a marker running along it as the page passes. The
 * four steps sit under it as a pair of doors on each side, swinging open off
 * their hinges as they arrive and standing off the page when pointed at.
 *
 * The film is the section's spine down the left — a slab with a real edge,
 * turned by the scroll — rather than a picture the reader has to track.
 *
 * It is muted, looping and gated on visibility: a decoder running for a
 * section nobody is looking at is a section further down the page dropping
 * frames.
 */
export default function RecipeFilm({ product }: { product: Product }) {
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
        0.3,
      );
      enter.fromTo(
        `.${styles.filmSlab}`,
        { y: 70, opacity: 0.001, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.16,
      );

      /*
       * The bar is wiped open from the left, so the marinade is laid down
       * first and the fifteen minutes at the pan arrive on the end of it —
       * which is the order the evening actually happens in. Clipped rather
       * than scaled, because scaling a bar with words in it stretches them.
       */
      gsap.fromTo(
        `.${styles.barTrack}`,
        /* The clip is let out well past the strip at rest, or it would cut off
           the shadow the strip casts on the page as well. */
        { clipPath: "inset(0 100% -44px 0)" },
        {
          clipPath: "inset(0 -44px -44px 0)",
          duration: 1.15,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: `.${styles.clock}`,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /* The marker walks the bar as the section passes — the section's own
         scroll standing in for the three quarters of an hour. */
      gsap.fromTo(
        `.${styles.pip}`,
        /* Stopped just short of either end, so the marker is always standing on
           the strip rather than hanging off the corner of it. */
        { "--pip": "1%" },
        {
          "--pip": "97%",
          ease: "none",
          scrollTrigger: {
            trigger: `.${styles.stage}`,
            start: "top 78%",
            end: "bottom 55%",
            scrub: 0.7,
          },
        },
      );

      /*
       * The steps tip up off the page one after the other, hinged on their own
       * rule. The list carries the perspective, so the four of them share one
       * vanishing point and the turn reads as four things standing up in the
       * same room rather than four unrelated skews.
       */
      gsap.fromTo(
        `.${styles.step}`,
        { y: 30, rotateX: -32, opacity: 0.001 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.steps}`,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /* The shopping list now sits at the foot of the method rather than in
         the head, so it arrives on its own account. One run of small type,
         one fade — not eight things popping in one after another. */
      gsap.fromTo(
        `.${styles.also}`,
        { y: 14, opacity: 0.001 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: `.${styles.also}`,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /* The dashes travel along the thread as the section passes. Sliding the
         dash offset keeps the line dashed the whole way, which drawing it with
         a growing dash would not — that only works on a solid stroke. */
      gsap.fromTo(
        `.${styles.threadPath}`,
        { strokeDashoffset: 0 },
        {
          strokeDashoffset: -140,
          ease: "none",
          scrollTrigger: {
            trigger: `.${styles.moves}`,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );

      /* The drawings sit far below the head, so they get their own trigger
         rather than riding the section's entrance timeline. They come up
         turned away and square themselves off as they land. */
      gsap.fromTo(
        `.${styles.move}`,
        { y: 44, rotateY: -34, opacity: 0.001 },
        {
          y: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.moves}`,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /*
       * And then they keep turning, slowly, for as long as the row is on
       * screen — the four of them leaning through the same few degrees at
       * offsets, so the strip reads as objects lying on a surface rather than
       * as four stickers. Scrubbed off the page's own scroll, which is the one
       * clock every other movement in the section is already keeping.
       */
      gsap.fromTo(
        `.${styles.moveArt}`,
        { rotateY: -18, rotateX: 8 },
        {
          rotateY: 18,
          rotateX: -8,
          ease: "none",
          stagger: 0.06,
          scrollTrigger: {
            trigger: `.${styles.moves}`,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    });

    /*
     * The slab turns as the page goes past it. Only where it is standing beside
     * the method: below that break it is stacked in its own column and already
     * facing the reader, and turning something that is not held still just
     * makes it swim.
     */
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
          `.${styles.filmSlab}`,
          { rotationY: 10, rotationX: 4 },
          { rotationY: -8, rotationX: -3, ease: "none", scrollTrigger: travel },
        );

        /* The light running over the glass, which is what sells the turn */
        gsap.fromTo(
          `.${styles.sheen}`,
          { xPercent: -75 },
          { xPercent: 75, ease: "none", scrollTrigger: travel },
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
      aria-label="How to cook it"
    >
      <div className={styles.inner}>
        {/*
          The heading and one line under it, and nothing else. It used to carry
          three facts alongside and a shopping list beneath — all of which the
          bar, the ratio and the method say again further down, and none of
          which a headline can be read over the top of.
        */}
        <header className={styles.head}>
          <p className={styles.eyebrow}>Cook it</p>
          {/* Forty-five, not thirty: thirty is the marinade alone, and a
              headline that contradicts the line set beside it is the first
              thing a reader notices. */}
          <h2 className={styles.heading}>
            Forty-five minutes,
            <br />
            mostly waiting.
          </h2>
          <p className={styles.lead}>
            {totalMinutes} minutes from pack to plate, and {waitingMinutes} of
            them are the marinade’s, not yours.
          </p>
        </header>

        <div className={styles.stage}>
          {/*
            The frame is a slab rather than a picture: the edge beside it is a
            real face standing at a right angle to it, so when the scroll
            turns the slab you see its thickness. It has to live outside
            the frame — the frame clips the video, and a clipping box
            flattens everything inside it back onto one plane.
          */}
          <div className={styles.filmCol}>
            <div className={styles.filmSlab}>
              <span className={styles.filmEdge} aria-hidden="true" />
              <div className={styles.filmFrame}>
                <video
                  ref={videoRef}
                  className={styles.video}
                  src={gobiAssets.film}
                  poster={gobiAssets.filmPoster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`Cooking ${product.name} from pack to plate`}
                />
                <span className={styles.sheen} aria-hidden="true" />
                <span className={styles.filmTag}>Pack to plate</span>
              </div>
            </div>
          </div>

          <div className={styles.method}>
            {/*
              The heading's claim, drawn. The two blocks are as wide as the
              minutes they stand for, so the marinade is twice the pan without
              anyone having to say so.
            */}
            <figure className={styles.clock}>
              {/* No caption over it any more. The heading makes the claim and
                  the two blocks are labelled with their own minutes, so a line
                  of type between them was the same sentence for a third time. */}
              <div className={styles.bar}>
                <div className={styles.barTrack}>
                  {gobiRecipe.timeline.map((span) => (
                    <div
                      key={span.label}
                      className={`${styles.span} ${
                        span.kind === "wait" ? styles.wait : styles.work
                      }`}
                      style={{ "--share": span.minutes } as React.CSSProperties}
                    >
                      <span className={styles.spanTime}>{span.minutes} min</span>
                      <span className={styles.spanName}>{span.label}</span>
                    </div>
                  ))}
                </div>
                <span className={styles.pip} aria-hidden="true" />
              </div>
            </figure>

            <ol className={styles.steps}>
              {gobiRecipe.steps.map((step, index) => (
                <li className={styles.step} key={step.title}>
                  <span className={styles.stepIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepText}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* The one line on the pack people miss, so it is a warning
                beside the method rather than a fifth thing to do */}
            <p className={styles.note}>
              <span className={styles.noteMark} aria-hidden="true">
                !
              </span>
              {gobiRecipe.note}
            </p>

            {/* The shopping list, at the foot of the method rather than under
                the headline. It is the least important thing in the section —
                a reminder of what is already in the kitchen — and it was the
                thing standing between the heading and the first instruction. */}
            <div className={styles.also}>
              <p className={styles.alsoLabel}>You also need</p>
              {/* Laid out inline, which is enough for some screen readers to
                  stop announcing it as a list — hence the explicit role. */}
              <ul
                className={styles.chips}
                role="list"
                aria-label="What else you need"
              >
                {gobiRecipe.ingredients.map((ingredient) => (
                  <li className={styles.chip} key={ingredient}>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.moves}>
          {/* One small line. "The method in four moves" sat under it saying
              what four numbered drawings on a thread already say. */}
          <h3 className={styles.movesHeading}>Or, without the pan</h3>

          <div className={styles.movesBody}>
            {/* The card's dashed thread, redrawn so a scroll can draw it. It
                hops the gaps between the drawings the way the printed one
                does, and is decoration only — the list carries the meaning. */}
            <svg
              className={styles.thread}
              viewBox="0 0 1000 60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className={styles.threadPath}
                d="M 125 50 C 190 -2, 310 -2, 375 50 C 440 -2, 560 -2, 625 50 C 690 -2, 810 -2, 875 50"
                fill="none"
              />
            </svg>

            <ol className={styles.moveList}>
              {gobiRecipe.moves.map((move) => (
                <li className={styles.move} key={move.id}>
                  <div className={styles.moveArt}>
                    <Image
                      src={
                        gobiAssets.moves[move.id as keyof typeof gobiAssets.moves]
                      }
                      alt=""
                      width={320}
                      height={320}
                      sizes="(max-width: 640px) 72px, (max-width: 1100px) 22vw, 128px"
                    />
                  </div>
                  <p className={styles.moveLabel}>{move.label}</p>
                  <p className={styles.moveText}>{move.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
