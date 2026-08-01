"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Ritual.module.css";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: "01",
    title: "Blend",
    copy: "Mix the masala with curd or water into a thick, clinging paste.",
  },
  {
    number: "02",
    title: "Rest",
    copy: "Coat and let it sit for thirty minutes so the spice sinks deep.",
  },
  {
    number: "03",
    title: "Fry",
    copy: "Into hot oil until golden and crisp. Garnish and serve hot.",
  },
];

/**
 * The three-step cooking ritual shared by both packs. A spice-orange thread
 * draws itself across the section as you scroll, and each step card lifts in
 * as the thread reaches it.
 */
export default function Ritual() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        `.${styles.thread}`,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 65%",
            scrub: 0.5,
          },
        },
      );

      gsap.fromTo(
        `.${styles.head} > *`,
        { y: 34, opacity: 0.001 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(`.${styles.step}`).forEach((step, i) => {
        gsap.fromTo(
          step,
          { y: 70, opacity: 0.001, rotate: i % 2 ? 2 : -2 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: step,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.ritual}
      aria-label="How to cook with RS Chef'z"
    >
      <svg
        className={styles.threadSvg}
        viewBox="0 0 1200 420"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.thread}
          d="M-20 90 C 220 30, 340 220, 600 210 S 980 380, 1220 330"
          pathLength={1}
        />
      </svg>

      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>The Ritual</p>
          <h2 className={styles.title}>Three steps. Zero guesswork.</h2>
          <p className={styles.sub}>
            Every pack carries the full recipe on the back. The short version
            never changes.
          </p>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.number} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {step.number}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepCopy}>{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
