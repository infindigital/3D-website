"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BuyButtons from "@/components/ui/BuyButtons";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

const LINE_ONE = ["Authentic", "Flavour."];
const LINE_TWO = ["Crafted", "to", "Perfection."];

export interface HeroAssets {
  /** Local file when committed, Higgsfield CDN URL otherwise */
  videoSrc: string;
  posterSrc: string;
}

/**
 * Cinematic hero. The type sits on the cream page and the dish footage lives
 * in a letterbox window below it, framed like a screen laid on the table.
 * Nothing is ever printed over the picture.
 *
 * Scrolling is the projector. The first stretch opens the window to full
 * bleed and lifts the type away; from there the scroll position drives the
 * film's own playhead, so the camera move only advances while the visitor
 * keeps going, and the page moves on to the products the moment the shot
 * lands. Phones and reduced motion keep the still frame instead.
 *
 * Two numbers carry the whole thing. JavaScript writes `--open` (0 at rest,
 * 1 full bleed) and the stylesheet derives every inset, the corner radius,
 * the shadow and the pull-back from it; the second is the playhead.
 */
export default function Hero({ assets }: { assets: HeroAssets }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wantsVideo, setWantsVideo] = useState(false);
  const [filmReady, setFilmReady] = useState(false);

  /* The file is fetched on the first sign of intent rather than at first
     paint, with a short fallback so it is buffered before anyone reaches it. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    if (reduced.matches || !wide.matches) return;

    let armed = false;
    const events = ["scroll", "wheel", "touchmove", "pointerdown"] as const;

    const arm = () => {
      if (armed) return;
      armed = true;
      window.clearTimeout(timer);
      events.forEach((type) => window.removeEventListener(type, arm));
      setWantsVideo(true);
    };

    const timer = window.setTimeout(arm, 1200);
    events.forEach((type) =>
      window.addEventListener(type, arm, { passive: true }),
    );

    return () => {
      window.clearTimeout(timer);
      events.forEach((type) => window.removeEventListener(type, arm));
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets = [
        `.${styles.frame}`,
        `.${styles.word}`,
        `.${styles.eyebrow}`,
        `.${styles.sub}`,
        `.${styles.ctas}`,
        `.${styles.cue}`,
      ];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { clearProps: "all", opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        `.${styles.eyebrow}`,
        { y: 24, opacity: 0.001, letterSpacing: "0.6em" },
        { y: 0, opacity: 1, letterSpacing: "0.34em", duration: 1.2 },
        0.15,
      );

      tl.fromTo(
        `.${styles.word}`,
        { yPercent: 118, rotate: 4, opacity: 0.001 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 1.3, stagger: 0.08 },
        0.3,
      );

      tl.fromTo(
        `.${styles.sub}`,
        { y: 28, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.8",
      );

      tl.fromTo(
        `.${styles.ctas}`,
        { y: 24, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.9 },
        "-=0.7",
      );

      /* The window slides up into place like a plate set down on the table */
      tl.fromTo(
        `.${styles.frame}`,
        { yPercent: 12, opacity: 0.001 },
        { yPercent: 0, opacity: 1, duration: 1.8, ease: "power3.out" },
        0.45,
      );

      tl.fromTo(
        `.${styles.cue}`,
        { opacity: 0.001 },
        { opacity: 1, duration: 0.8 },
        "-=0.6",
      );
    }, stageRef);

    return () => ctx.revert();
  }, []);

  /*
   * Scroll choreography, rebuilt when the film arrives because the hero grows
   * to make room for it. The stage is sticky, so all of this plays while the
   * page appears to hold still: the letterbox opens first, then the rest of
   * the hero's height is the film itself, one scrolled second at a time.
   */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const frame = frameRef.current;
      const open = { value: 0 };
      const playhead = { value: 0 };

      const seek = () => {
        const video = videoRef.current;
        if (!video) return;
        const length = video.duration;
        if (!Number.isFinite(length) || length === 0) return;
        /* Clear of the very end, which some browsers refuse to seek to */
        const target = Math.min(playhead.value * length, length - 0.05);
        if (Math.abs(video.currentTime - target) > 0.03) {
          video.currentTime = target;
        }
      };

      /* With a film loaded the window opens in the first fifth and the rest
         is playback; without one, opening is all the hero has to do. */
      const openSpan = filmReady ? 0.2 : 1;

      const scrollTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });

      scrollTl.to(
        open,
        {
          value: 1,
          duration: openSpan,
          ease: "power2.inOut",
          onUpdate: () => frame?.style.setProperty("--open", `${open.value}`),
        },
        0,
      );

      scrollTl.to(
        `.${styles.copy}`,
        {
          yPercent: -14,
          opacity: 0,
          ease: "power2.in",
          duration: openSpan * 0.65,
        },
        0,
      );

      scrollTl.to(
        `.${styles.cue}`,
        { opacity: 0, duration: openSpan * 0.2 },
        0,
      );

      if (filmReady) {
        scrollTl.to(playhead, { value: 1, duration: 0.8, onUpdate: seek }, 0.2);
      }
    }, stageRef);

    return () => ctx.revert();
  }, [filmReady]);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-film={filmReady ? "true" : "false"}
      aria-label="RS Chef'z"
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>RS Chef&apos;z Masalas</p>
          <h1 className={styles.headline}>
            <span className={styles.line}>
              {LINE_ONE.map((word) => (
                <span key={word} className={styles.mask}>
                  <span
                    className={`${styles.word} ${
                      word === "Flavour." ? styles.wordAccent : ""
                    }`}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </span>
            <span className={styles.line}>
              {LINE_TWO.map((word) => (
                <span key={word} className={styles.mask}>
                  <span className={styles.word}>{word}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className={styles.sub}>
            Gobi Manchurian, Chicken 65 and fish fry, cooked at home the way the
            restaurant does it. Two masalas, no shortcuts.
          </p>
          <BuyButtons className={styles.ctas} />
        </div>

        <div ref={frameRef} className={styles.frame} aria-hidden="true">
          <div className={styles.film}>
            <Image
              className={styles.plate}
              src={assets.posterSrc}
              alt=""
              fill
              priority
              sizes="100vw"
            />
            {wantsVideo && (
              <video
                ref={videoRef}
                className={`${styles.plate} ${styles.video}`}
                data-ready={filmReady ? "true" : "false"}
                muted
                playsInline
                preload="auto"
                onLoadedData={(event) => {
                  /* A nudge off zero forces the first frame to decode and
                     paint while the element is still paused. */
                  event.currentTarget.currentTime = 0.01;
                  setFilmReady(true);
                }}
              >
                <source src={assets.videoSrc} type="video/mp4" />
              </video>
            )}
          </div>
        </div>

        <div className={styles.cue} aria-hidden="true">
          <span className={styles.cueDot} />
          <span className={styles.cueLabel}>Scroll to play</span>
        </div>
      </div>
    </section>
  );
}
