"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./PromiseBand.module.css";

gsap.registerPlugin(ScrollTrigger);

const PROMISES = [
  { title: "No artificial colors", copy: "The red comes from chillies." },
  { title: "No preservatives", copy: "Sealed fresh, nothing added." },
  { title: "No artificial flavors", copy: "Only ground spice and skill." },
];

/**
 * The promise straight off the pack, printed big. Pentagon badges echo the
 * logo mark and swing in one by one as the band enters.
 */
export default function PromiseBand() {
  const sectionRef = useRef<HTMLElement>(null);

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
        `.${styles.head} > *`,
        { y: 34, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
        0,
      );
      enter.fromTo(
        `.${styles.card}`,
        { y: 60, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.14 },
        0.25,
      );
      enter.fromTo(
        `.${styles.badge}`,
        { rotate: -120, scale: 0.4 },
        { rotate: 0, scale: 1, duration: 1.1, stagger: 0.14, ease: "back.out(1.6)" },
        0.3,
      );
      enter.fromTo(
        `.${styles.footnote}`,
        { y: 20, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.8,
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.band}
      aria-label="The RS Chef'z promise"
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>The Promise</p>
          <h2 className={styles.title}>Printed on every pack. Kept in every batch.</h2>
        </div>

        <ul className={styles.cards}>
          {PROMISES.map((promise) => (
            <li key={promise.title} className={styles.card}>
              <span className={styles.badge} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 10 17.5 19 7" />
                </svg>
              </span>
              <h3 className={styles.cardTitle}>{promise.title}</h3>
              <p className={styles.cardCopy}>{promise.copy}</p>
            </li>
          ))}
        </ul>

        <p className={styles.footnote}>
          FSSAI licensed. Proudly a Product of India, made by SS Food Products,
          Mangaluru.
        </p>
      </div>
    </section>
  );
}
