"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiPackSpec, gobiPacks, type PackSize } from "@/config/gobi";
import type { Product } from "@/config/products";
import { getAmazonUrl, getWhatsAppUrl } from "@/config/site";
import styles from "./PackShelf.module.css";

gsap.registerPlugin(ScrollTrigger);

/** How far a card leans, in degrees, at the far corner of itself. */
const TILT = 7;

/* Each button carries its own mark as well as its own words, so the pair is
   told apart by shape and not only by which one is filled. */
function WhatsAppMark() {
  return (
    <svg
      className={styles.buyIcon}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.2-.31a8.08 8.08 0 0 1-1.24-4.31c0-4.48 3.64-8.12 8.12-8.12s8.12 3.64 8.12 8.12-3.64 8.13-8.12 8.13Zm4.45-6.08c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21a7.34 7.34 0 0 1-1.35-1.68c-.14-.24-.02-.38.1-.5.11-.11.25-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.35 1 2.51c.12.16 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

/** A basket, for the shop that is not this site. */
function CartMark() {
  return (
    <svg
      className={styles.buyIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 3h2.2l2.3 11.2a1.8 1.8 0 0 0 1.8 1.4h8.4a1.8 1.8 0 0 0 1.8-1.4L20.5 7H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}

interface PackShelfProps {
  product: Product;
  /** The sizes to stand on the shelf. Defaults to Gobi's, whose page this began on. */
  packs?: PackSize[];
  /**
   * The measured pouch drawn under the shelf. Pass null on a product whose
   * pouch has not been measured — a dimension sheet is the one thing on this
   * page that cannot be inferred from another pack's.
   */
  spec?: typeof gobiPackSpec | null;
  /** The three lines above the shelf, when the range is not Gobi's four. */
  copy?: { eyebrow: string; heading: ReactNode; lead: ReactNode };
}

const GOBI_COPY = {
  eyebrow: "Pick a size",
  heading: (
    <>
      A sachet for tonight.
      <br />
      A sack for the kitchen.
    </>
  ),
  lead: (
    <>
      The same masala in four sizes — one fry at home, or a week&rsquo;s
      service.
    </>
  ),
};

/**
 * The four sizes, standing on a shelf rather than laid out in a grid.
 *
 * Each card holds the same photograph of the pack at its own height, so the
 * range reads as a range at a glance — a sachet next to a catering sack —
 * before a word of it is read. The card leans towards the pointer on its own
 * axis, which is what makes four flat rectangles feel like four objects.
 */
export default function PackShelf({
  product,
  packs = gobiPacks,
  spec = gobiPackSpec,
  copy = GOBI_COPY,
}: PackShelfProps) {
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

      /* The measurements are drawn on, the way they would be on a spec sheet:
         the rules run out from their corners, then the figures land. Only when
         there is a sheet to draw: a product whose pouch has not been measured
         renders no block, and a trigger pointed at nothing is a warning in the
         console and a timeline that never fires. */
      if (!sectionRef.current?.querySelector(`.${styles.spec}`)) return;

      const specIn = gsap.timeline({
        scrollTrigger: {
          trigger: `.${styles.spec}`,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });

      specIn.fromTo(
        `.${styles.rule}`,
        { scale: 0 },
        { scale: 1, duration: 0.75, stagger: 0.12, ease: "power2.inOut" },
        0,
      );
      specIn.fromTo(
        `.${styles.figure}`,
        { opacity: 0.001, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "power2.out" },
        0.35,
      );
      specIn.fromTo(
        `.${styles.claim}`,
        { y: 16, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" },
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
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 className={styles.heading}>{copy.heading}</h2>
          <p className={styles.lead}>{copy.lead}</p>
        </header>

        <ul className={styles.row}>
          {packs.map((pack) => {
            /* Both buttons are the card's own: the message names this size and
               the Amazon link is this size's listing where one exists. Nobody
               has to pick a size twice. */
            const orderUrl = getWhatsAppUrl(pack.order);
            const amazonUrl = getAmazonUrl(pack.amazonUrl);
            /* Four cards each holding a link labelled "Amazon" is four
               identical links to a screen reader running through them out of
               context, hence the size in the accessible name. */
            const forSize = pack.unit
              ? `${product.name}, ${pack.size} ${pack.unit}`
              : `${product.name}, ${pack.size}`;

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
                    {pack.yields && (
                      <p className={styles.yields}>{pack.yields}</p>
                    )}
                  </div>

                  <div className={styles.actions}>
                    {orderUrl && (
                      <a
                        className={styles.order}
                        href={orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Order ${forSize} on WhatsApp`}
                      >
                        <WhatsAppMark />
                        WhatsApp Order
                      </a>
                    )}
                    <a
                      className={styles.amazon}
                      href={amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buy ${forSize} on Amazon`}
                    >
                      <CartMark />
                      Amazon
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {spec && (
          <div className={styles.spec}>
            {/* The pouch measured, as the owner's dimension sheet has it. The
                rules are CSS boxes rather than an SVG so they can be scaled from
                their own corner without any viewBox arithmetic. */}
            <div className={styles.specArt}>
              <span className={styles.dimTop} aria-hidden="true">
                <span className={styles.rule} />
                <span className={styles.figure}>{spec.width}</span>
              </span>

              <Image
                className={styles.specImg}
                src={product.images.front}
                alt=""
                width={700}
                height={850}
                sizes="(max-width: 640px) 40vw, 190px"
              />

              <span className={styles.dimSide} aria-hidden="true">
                <span className={styles.rule} />
                <span className={styles.figure}>{spec.height}</span>
              </span>

              <span className={styles.dimDepth} aria-hidden="true">
                <span className={styles.rule} />
                <span className={styles.figure}>{spec.depth}</span>
              </span>
            </div>

            <div className={styles.specBody}>
              <h3 className={styles.specHeading}>The pouch, actual size</h3>
              <p className={styles.specLine}>
                {spec.width} across, {spec.height} tall,{" "}
                {spec.depth} deep. Flat for a shelf, sealed until you open
                it.
              </p>
              <ul className={styles.claims}>
                {spec.claims.map((claim) => (
                  <li className={styles.claim} key={claim}>
                    {claim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
