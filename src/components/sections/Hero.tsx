"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BuyButtons from "@/components/ui/BuyButtons";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

/* Three.js layer loads client-side only and skips itself without WebGL
   or with reduced motion, so it never blocks the core hero. */
const HeroCanvas = dynamic(() => import("@/three/HeroCanvas"), { ssr: false });

const HERO_VIDEO = "/assets/hero/hero-loop.mp4";
const HERO_POSTER = "/assets/hero/hero-poster.webp";

const LINE_ONE = ["Authentic", "Flavour."];
const LINE_TWO = ["Crafted", "to", "Perfection."];

export interface HeroPack {
  /** Public URL of the owner-supplied package front image */
  src: string;
  slug: string;
  name: string;
}

export interface HeroAssets {
  video: boolean;
  poster: boolean;
  chilli: boolean;
  curryLeaf: boolean;
  starAnise: boolean;
  /** Packs whose artwork exists in public/assets/products */
  packs: HeroPack[];
}

interface FloatConfig {
  key: "chilli" | "curryLeaf" | "starAnise";
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
 * Cinematic hero. A generated 3D camera move over the signature dishes plays
 * as a full-bleed video, with parallax ingredient cutouts floating above it
 * and a masked headline reveal. Scrolling tips the content back in 3D while
 * the video zooms deeper and the cutouts drift at depth-based speeds.
 * Reduced motion and small screens get the poster image instead of the video.
 * Missing media files simply do not render, the layout stays intact until
 * they land in public/assets/hero.
 *
 * Each animation system owns its own element so they compose instead of
 * fighting: .float (pointer parallax, CSS vars) > .floatDrift (GSAP entrance
 * y + scroll yPercent) > .floatIdle (CSS keyframes).
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
        `.${styles.floatDrift}`,
        `.${styles.packetDrift}`,
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

      if (document.querySelector(`.${styles.packetDrift}`)) {
        tl.fromTo(
          `.${styles.packetDrift}`,
          {
            y: 90,
            opacity: 0.001,
            rotateY: (index: number) => (index === 0 ? 32 : -32),
            transformPerspective: 900,
          },
          {
            y: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1.5,
            stagger: 0.14,
            ease: "power3.out",
          },
          0.75,
        );
      }

      if (document.querySelector(`.${styles.floatDrift}`)) {
        tl.fromTo(
          `.${styles.floatDrift}`,
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

      /*
       * Scroll choreography, scrubbed against the hero's own height.
       * The content plane tips away from the viewer while the video zooms
       * deeper and each cutout drifts by its depth, which is what sells the
       * dimensionality on scroll. Entrance animates y, scroll animates
       * yPercent, so the two never overwrite each other.
       */
      const scrollTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scopeRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      scrollTl.to(`.${styles.mediaZoom}`, { yPercent: 14, scale: 1.18 }, 0);

      scrollTl.to(
        `.${styles.content}`,
        {
          yPercent: -20,
          scale: 0.92,
          rotateX: 16,
          opacity: 0,
          transformPerspective: 1100,
          transformOrigin: "center 20%",
        },
        0,
      );

      gsap.utils
        .toArray<HTMLElement>(`.${styles.floatDrift}`)
        .forEach((el) => {
          const depth = Number(el.dataset.depth) || 20;
          scrollTl.to(el, { yPercent: -depth * 1.4, rotate: depth * 0.35 }, 0);
        });

      scrollTl.fromTo(
        `.${styles.cue}`,
        { opacity: 1 },
        { opacity: 0, duration: 0.18, immediateRender: false },
        0,
      );
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  const floats = floatConfigs.filter((f) => assets[f.key]);

  return (
    <section ref={sectionRef} className={styles.hero} aria-label="RS Chef'z">
      <div ref={scopeRef} className={styles.scope}>
        <div className={styles.media} aria-hidden="true">
          <div className={styles.mediaZoom}>
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
          </div>
          <div className={styles.veil} />
        </div>

        <HeroCanvas className={styles.canvasLayer} />

        {floats.map((float, index) => (
          <div
            key={`${float.className}-${index}`}
            className={`${styles.float} ${styles[float.className]}`}
            style={{ "--depth": float.depth } as React.CSSProperties}
            aria-hidden="true"
          >
            <div className={styles.floatDrift} data-depth={float.depth}>
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
          {assets.packs.length > 0 && (
            <div className={styles.packRow}>
              {assets.packs.map((pack, index) => (
                <Link
                  key={pack.slug}
                  href={`/products/${pack.slug}`}
                  className={`${styles.packet} ${
                    index === 0 ? styles.packetLeft : styles.packetRight
                  }`}
                  style={{ "--depth": 24 } as React.CSSProperties}
                  aria-label={`Explore ${pack.name}`}
                >
                  <div className={styles.packetDrift}>
                    <div className={styles.packetIdle}>
                      <Image
                        className={styles.packetImg}
                        src={pack.src}
                        alt={`${pack.name} pack`}
                        width={400}
                        height={560}
                        priority
                        sizes="(max-width: 560px) 40vw, 200px"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
