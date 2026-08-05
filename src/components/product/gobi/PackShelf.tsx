"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiPacks } from "@/config/gobi";
import type { Product } from "@/config/products";
import { getWhatsAppUrl, siteConfig } from "@/config/site";
import styles from "./PackShelf.module.css";

gsap.registerPlugin(ScrollTrigger);

/** How far a card leans, in degrees, at the far corner of itself. */
const TILT = 7;

/**
 * The four sizes, standing on a shelf rather than laid out in a grid.
 *
 * Each card holds the same photograph of the pack at its own height, so the
 * range reads as a range at a glance — a sachet next to a catering sack —
 * before a word of it is read. The card leans towards the pointer on its own
 * axis, which is what makes four flat rectangles feel like four objects.
 */
export default function PackShelf({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* A card that leans under a finger only ever looks like a mis-tap. */
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, section);
    const cleanups: Array<() => void> = [];

    for (const card of cards) {
      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        card.style.setProperty("--tilt-x", `${(-y * TILT).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * TILT).toFixed(2)}deg`);
        card.style.setProperty("--lift", "1");
      };
      const onLeave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--lift", "0");
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      });
    }

    return () => {
      for (const off of cleanups) off();
    };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const enter = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 74%",
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
        0.24,
      );
      /* The cards stand up in order, smallest first, so the eye is walked
         along the range rather than shown all four at once. This drives the
         slot rather than the card, because the card's own transform belongs
         to the pointer tilt and an inline one from GSAP would kill it. */
      enter.fromTo(
        `.${styles.slot}`,
        { y: 64, opacity: 0.001, rotateX: 14 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          stagger: 0.09,
          ease: "power3.out",
        },
        0.3,
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.shelf}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Pack sizes"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Pick a size</p>
          <h2 className={styles.heading}>
            A sachet for tonight.
            <br />
            A sack for the kitchen.
          </h2>
          <p className={styles.lead}>
            The same masala in four sizes, so a single fry at home and a
            week&rsquo;s service in a canteen both come out of the right pack.
          </p>
        </header>

        <ul className={styles.row}>
          {gobiPacks.map((pack) => {
            const orderUrl = getWhatsAppUrl(pack.order);

            return (
              <li className={styles.slot} key={pack.id}>
                <article
                  className={styles.card}
                  style={{ "--scale": pack.scale } as React.CSSProperties}
                >
                  <div className={styles.art}>
                    <Image
                      className={styles.artImg}
                      src={product.images.front}
                      alt={`${product.name}, ${pack.size} pack`}
                      width={700}
                      height={850}
                      sizes="(max-width: 640px) 46vw, (max-width: 1100px) 30vw, 220px"
                    />
                  </div>

                  <div className={styles.body}>
                    <p className={styles.size}>
                      {pack.size}
                      {pack.unit && (
                        <span className={styles.unit}>{pack.unit}</span>
                      )}
                    </p>
                    <p className={styles.who}>{pack.who}</p>
                    <p className={styles.yields}>{pack.yields}</p>
                  </div>

                  <div className={styles.actions}>
                    {orderUrl && (
                      <a
                        className={styles.order}
                        href={orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Order {pack.size}
                      </a>
                    )}
                    <a
                      className={styles.amazon}
                      href={siteConfig.amazonStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Amazon
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
