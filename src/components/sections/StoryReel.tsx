"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./StoryReel.module.css";

gsap.registerPlugin(ScrollTrigger);

const STATEMENTS = [
  { text: "Born in Mangaluru's kitchens.", wash: "washTurmeric" },
  { text: "Blended the way chefs blend.", wash: "washChilli" },
  { text: "Cooked in yours, in minutes.", wash: "washGreen" },
];

/**
 * A pinned statement reel. The section holds the viewport while three
 * statements take turns: words rise out of masks, hold, then lift away as
 * the next line arrives, with a colour wash crossfading behind each one.
 * Without JavaScript or with reduced motion the statements simply stack,
 * so the copy is always readable.
 */
export default function StoryReel() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const statements = gsap.utils.toArray<HTMLElement>(
        `.${styles.statement}`,
      );
      const washes = gsap.utils.toArray<HTMLElement>(`.${styles.wash}`);

      // Stack the statements for the pinned play
      gsap.set(`.${styles.reel}`, { height: "100vh" });
      gsap.set(statements, {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        yPercent: -50,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=260%",
          scrub: 0.6,
          pin: true,
        },
      });

      statements.forEach((statement, index) => {
        const words = statement.querySelectorAll(`.${styles.word}`);
        const at = index * 1;

        tl.fromTo(
          words,
          { yPercent: 120, rotate: 4 },
          { yPercent: 0, rotate: 0, stagger: 0.05, duration: 0.34 },
          at,
        );
        tl.to(washes[index], { opacity: 1, duration: 0.3 }, at);

        if (index < statements.length - 1) {
          tl.to(
            words,
            { yPercent: -120, rotate: -3, stagger: 0.04, duration: 0.3 },
            at + 0.68,
          );
          tl.to(washes[index], { opacity: 0, duration: 0.3 }, at + 0.7);
        }
      });

      return () => {
        gsap.set(`.${styles.reel}`, { clearProps: "height" });
        gsap.set(statements, { clearProps: "all" });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.story}
      aria-label="The RS Chef'z story"
    >
      {STATEMENTS.map((statement) => (
        <div
          key={statement.wash}
          className={`${styles.wash} ${styles[statement.wash]}`}
          aria-hidden="true"
        />
      ))}
      <div className={styles.reel}>
        {STATEMENTS.map((statement) => (
          <p key={statement.text} className={styles.statement}>
            {statement.text.split(" ").map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`} className={styles.mask}>
                <span className={styles.word}>{word}</span>
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}
