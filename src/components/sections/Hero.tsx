"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import BuyButtons from "@/components/ui/BuyButtons";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import styles from "./Hero.module.css";

const HERO_VIDEO = "/assets/hero/hero-loop.mp4";
const HERO_POSTER = "/assets/hero/hero-poster.webp";

const LINE_ONE = ["Authentic", "Flavour."];
const LINE_TWO = ["Crafted", "to", "Perfection."];

export interface HeroAssets {
  video: boolean;
  poster: boolean;
  chilli: boolean;
  curryLeaf: boolean;
  starAnise: boolean;
}

interface FloatConfig {
  key: keyof HeroAssets;
  src: string;
  className: string;
  depth: number;
  size: number;
}

const floatConfigs: FloatConfig[] = [
  {
    key: "chilli",
    src: "/assets/hero/chilli.png",
    className: "floatChilli",
    depth: 34,
    size: 180,
  },
  {
    key: "curryLeaf",
    src: "/assets/hero/curry-leaf.png",
    className: "floatLeaf",
    depth: 22,
    size: 170,
  },
  {
    key: "starAnise",
    src: "/assets/hero/star-anise.png",
    className: "floatAnise",
    depth: 46,
    size: 120,
  },
  {
    key: "chilli",
    src: "/assets/hero/chilli.png",
    className: "floatChilliSmall",
    depth: 58,
    size: 96,
  },
];

/**
 * Cinematic hero. A generated 3D-style camera move through spices plays as a
 * full-bleed video, with parallax ingredient cutouts floating above it and a
 * masked headline reveal. Reduced motion and small screens get the poster
 * image instead of the video. Missing media files simply do not render, the
 * layout stays intact until they land in public/assets/hero.
 */
export default function Hero({ assets }: { assets: HeroAssets }) {
  const sectionRef = usePointerParallax<HTMLElement>();
  const scopeRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const update = () => setShowVideo(!reduced.matches && wide.matches);
    update();
    reduced.addEventListener("change", update);
    wide.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      wide.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets = [
        `.${styles.media}`,
        `.${styles.word}`,
        `.${styles.eyebrow}`,
        `.${styles.sub}`,
        `.${styles.ctas}`,
        `.${styles.float}`,
        `.${styles.cue}`,
      ];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { clearProps: "all", opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        `.${styles.media}`,
        { scale: 1.12, opacity: 0.001 },
        { scale: 1, opacity: 1, duration: 2.4, ease: "power2.out" },
        0,
      );

      tl.fromTo(
        `.${styles.eyebrow}`,
        { y: 26, opacity: 0.001, letterSpacing: "0.6em" },
        { y: 0, opacity: 1, letterSpacing: "0.34em", duration: 1.2 },
        0.4,
      );

      tl.fromTo(
        `.${styles.word}`,
        { yPercent: 120, rotate: 5, opacity: 0.001 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.25,
          stagger: 0.09,
        },
        0.55,
      );

      tl.fromTo(
        `.${styles.sub}`,
        { y: 32, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.75",
      );

      tl.fromTo(
        `.${styles.ctas}`,
        { y: 26, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.9 },
        "-=0.65",
      );

      if (document.querySelector(`.${styles.float}`)) {
        tl.fromTo(
          `.${styles.float}`,
          { y: 70, opacity: 0.001, rotate: 14 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.7,
            stagger: 0.12,
            ease: "power3.out",
          },
          0.85,
        );
      }

      tl.fromTo(
        `.${styles.cue}`,
        { opacity: 0.001 },
        { opacity: 1, duration: 0.8 },
        "-=0.5",
      );
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  const floats = floatConfigs.filter((f) => assets[f.key]);

  return (
    <section ref={sectionRef} className={styles.hero} aria-label="RS Chef'z">
      <div ref={scopeRef} className={styles.scope}>
        <div className={styles.media} aria-hidden="true">
          {assets.video && showVideo ? (
            <video
              className={styles.video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={assets.poster ? HERO_POSTER : undefined}
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          ) : assets.poster ? (
            <Image
              className={styles.video}
              src={HERO_POSTER}
              alt=""
              fill
              priority
              sizes="100vw"
            />
          ) : (
            <div className={styles.mediaFallback} />
          )}
          <div className={styles.veil} />
        </div>

        {floats.map((float, index) => (
          <div
            key={`${float.className}-${index}`}
            className={`${styles.float} ${styles[float.className]}`}
            style={{ "--depth": float.depth } as React.CSSProperties}
            aria-hidden="true"
          >
            <div className={styles.floatIdle}>
              <Image
                src={float.src}
                alt=""
                width={float.size}
                height={float.size}
                sizes={`${float.size}px`}
              />
            </div>
          </div>
        ))}

        <div className={styles.content}>
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
            Bring restaurant-style taste to your kitchen with premium RS
            Chef&apos;z masalas.
          </p>
          <BuyButtons className={styles.ctas} />
        </div>

        <div className={styles.cue} aria-hidden="true">
          <span className={styles.cueDot} />
          <span className={styles.cueLabel}>Scroll</span>
        </div>
      </div>
    </section>
  );
}
