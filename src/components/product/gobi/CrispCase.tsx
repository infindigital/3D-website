"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { gobiAssets, gobiCrust, gobiFeatures, gobiPromises } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./CrispCase.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The case for the pack, told as a bento rather than a paragraph.
 *
 * A claim strip runs across the top, then the spread stands as one large
 * picture with the five promises, the blend and the pack's own ratio laid
 * around it. Every tile lifts in on its own beat, and the picture keeps
 * drifting under the pointer at a shallower depth than the tiles in front of
 * it, which is what gives the panel its depth without a single 3D transform.
 */
export default function CrispCase({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const bentoRef = usePointerParallax<HTMLDivElement>();

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
        { y: 24, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.28,
      );
      /* Through the tile's own variables rather than its transform, which
         belongs to the pointer drift — an inline one here would end the
         entrance by overwriting it. */
      enter.fromTo(
        `.${styles.tile}`,
        { "--enter-y": "44px", "--enter-s": 0.97, opacity: 0.001 },
        {
          "--enter-y": "0px",
          "--enter-s": 1,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.22,
      );

      /* The pen goes under the word once the heading has finished arriving.
         A solid stroke, so growing the dash really does draw it. */
      const mark = sectionRef.current?.querySelector<SVGPathElement>(
        `.${styles.markPath}`,
      );
      if (mark) {
        const length = mark.getTotalLength();
        mark.style.strokeDasharray = `${length}`;
        enter.fromTo(
          mark,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
          0.62,
        );
      }

      /* The floret is built up from the middle out, which is the order the
         cook builds it in — gobi, then paste, then crust. */
      enter.fromTo(
        `.${styles.crustRing}`,
        { scale: 0.3, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: { each: 0.14, from: "end" },
          ease: "back.out(1.5)",
          /* The origin is left to the stylesheet, which puts it at the
             circle's own centre via `transform-box: fill-box` — naming user
             units here would fight that and scale each ring off-centre. */
        },
        0.5,
      );
      enter.fromTo(
        `.${styles.crustGrit}`,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        1.1,
      );

      /* The picture rises through its own frame as the panel passes, so the
         bento never sits completely still while it is on screen. */
      gsap.fromTo(
        `.${styles.picImg}`,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.case}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Why this masala"
    >
      <div className={styles.motes} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Two identical runs, so the strip can slide a whole run and start
          over without the seam ever reaching the edge of the screen. */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {[0, 1].map((run) => (
            <ul className={styles.tickerRun} key={run}>
              {gobiPromises.map((promise) => (
                <li key={promise} className={styles.promise}>
                  {promise}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Why it works</p>
          <h2 className={styles.heading}>
            Crisp is not luck.
            <br />
            It is the{" "}
            <span className={styles.marked}>
              coating
              {/* Drawn under the word rather than typed as an underline, so
                  it keeps the wobble of a pen and can be stroked on. */}
              <svg
                className={styles.mark}
                viewBox="0 0 200 18"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className={styles.markPath}
                  d="M4 12 C 46 4, 92 15, 138 7 C 162 3, 182 9, 196 6"
                  fill="none"
                />
              </svg>
            </span>
            .
          </h2>
          <p className={styles.lead}>
            One mix does the marinade, the crust and the seasoning. The heat is
            the only thing left to get right.
          </p>
        </header>

        <div className={styles.bento} ref={bentoRef}>
          <figure className={`${styles.tile} ${styles.pic}`}>
            <Image
              className={styles.picImg}
              src={gobiAssets.spread}
              alt="Gobi Manchurian served dry, in gravy and as a tikka, with fresh spices around them"
              width={1600}
              height={1067}
              sizes="(max-width: 720px) 92vw, (max-width: 1100px) 94vw, 620px"
            />
            <figcaption className={styles.picCaption}>
              <span className={styles.picCaptionTitle}>One pack, a table</span>
              <span className={styles.picCaptionBody}>
                Manchurian, fry and tikka — gobi, paneer, mushroom or potato.
              </span>
            </figcaption>
          </figure>

          {gobiFeatures.map((feature, index) => (
            <article
              className={`${styles.tile} ${styles.card}`}
              key={feature.title}
              style={{ gridArea: `f${index + 1}` }}
            >
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardBody}>{feature.body}</p>
            </article>
          ))}

          <div
            className={`${styles.tile} ${styles.ratio}`}
            role="group"
            aria-label="How much to use"
          >
            <span className={styles.ratioLabel}>Use</span>
            <div className={styles.ratioLine}>
              <span className={styles.ratioValue}>{product.ratio.masala}</span>
              <span className={styles.ratioArrow} aria-hidden="true">
                &rarr;
              </span>
              <span className={styles.ratioValue}>{product.ratio.food}</span>
            </div>
            <p className={styles.ratioNote}>{product.usage}</p>
          </div>

          <div className={`${styles.tile} ${styles.crust}`}>
            <span className={styles.blendLabel}>The coat, in section</span>

            <div className={styles.crustBody}>
              <svg
                className={styles.crustArt}
                viewBox="0 0 220 220"
                role="img"
                aria-label="A fried floret cut through: golden crust outside, masala paste under it, cauliflower at the centre"
              >
                {gobiCrust.map((layer) => (
                  <circle
                    className={styles.crustRing}
                    key={layer.name}
                    cx="110"
                    cy="110"
                    r={layer.r}
                    fill={layer.tone}
                  />
                ))}
                {/* A dozen flecks of crust, so the outer ring reads as fried
                    rather than as a flat disc. */}
                <g className={styles.crustGrit} aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => {
                    const a = (i / 14) * Math.PI * 2 + 0.4;
                    const r = 68 + (i % 3) * 6;
                    return (
                      <circle
                        key={i}
                        cx={110 + Math.cos(a) * r}
                        cy={110 + Math.sin(a) * r}
                        r={i % 2 ? 3.4 : 2.2}
                      />
                    );
                  })}
                </g>
              </svg>

              <ol className={styles.crustList}>
                {gobiCrust.map((layer) => (
                  <li className={styles.crustItem} key={layer.name}>
                    <span
                      className={styles.crustSwatch}
                      style={{ background: layer.tone }}
                      aria-hidden="true"
                    />
                    <span className={styles.crustName}>{layer.name}</span>
                    <span className={styles.crustText}>{layer.body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
