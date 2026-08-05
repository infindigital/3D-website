"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiAssets, gobiRecipe } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./RecipeFilm.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The recipe, with the film doing the explaining.
 *
 * The picture holds still at the top of the screen while the four steps pass
 * it, and the step level with the film is the one lit — so the reader is
 * always looking at the sentence for the thing the film is doing. On a phone
 * there is no room to stand a portrait film beside anything, so it leads and
 * the steps follow underneath.
 *
 * The film is muted, looping and gated on visibility: a decoder running for a
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
        `.${styles.meta}`,
        { y: 22, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.75 },
        0.3,
      );
      enter.fromTo(
        `.${styles.chip}`,
        { y: 18, opacity: 0.001, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          stagger: 0.05,
          ease: "back.out(1.6)",
        },
        0.36,
      );
      enter.fromTo(
        `.${styles.filmFrame}`,
        { y: 70, opacity: 0.001, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.16,
      );

      /* Each step arrives on its own, and lights while it is level with the
         film rather than merely once it has been seen. */
      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`);
      for (const step of steps) {
        gsap.fromTo(
          step,
          { "--enter-y": "44px", opacity: 0.001 },
          {
            "--enter-y": "0px",
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );

        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          end: "bottom 42%",
          toggleClass: { targets: step, className: styles.stepOn },
        });
      }
    });

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
        <header className={styles.head}>
          <p className={styles.eyebrow}>Cook it</p>
          <h2 className={styles.heading}>
            Thirty minutes,
            <br />
            mostly waiting.
          </h2>
          <dl className={styles.meta}>
            <div className={styles.metaItem}>
              <dt>Makes</dt>
              <dd>{gobiRecipe.yield}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Takes</dt>
              <dd>{gobiRecipe.time}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Masala</dt>
              <dd>{product.ratio.masala} per batch</dd>
            </div>
          </dl>
          <ul className={styles.chips} aria-label="What else you need">
            {gobiRecipe.ingredients.map((ingredient) => (
              <li className={styles.chip} key={ingredient}>
                {ingredient}
              </li>
            ))}
          </ul>
        </header>

        <div className={styles.stage}>
          <div className={styles.filmCol}>
            <div className={styles.filmSticky}>
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
                <span className={styles.filmTag}>Pack to plate</span>
              </div>
            </div>
          </div>

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
            <li className={`${styles.step} ${styles.note}`}>
              <span className={styles.stepIndex} aria-hidden="true">
                !
              </span>
              <div className={styles.stepBody}>
                <p className={styles.stepText}>{gobiRecipe.note}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
