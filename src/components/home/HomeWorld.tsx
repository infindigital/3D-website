"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { preload } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Cursor from "@/components/ui/Cursor";
import Magnetic from "@/components/ui/Magnetic";
import { scrollToOffset } from "@/components/layout/SmoothScroll";
import type { Product } from "@/config/products";
import type { StagePack } from "@/three/world/types";
import { worldState } from "@/three/world/worldState";
import { bandOpacity } from "@/three/world/bands";
import { FILM_POSTER, FILM_SRC } from "@/three/world/film";
import { supportsWebGL } from "@/utils/webgl";
import styles from "./HomeWorld.module.css";

gsap.registerPlugin(ScrollTrigger);

const WorldCanvas = dynamic(() => import("@/three/world/WorldCanvas"), {
  ssr: false,
});

/**
 * The immersive layout is decided by this media query and by the identical
 * one in HomeWorld.module.css. **The two must stay in step**, exactly as
 * the hero's do: the stylesheet alone decides the page's shape so it is
 * right on the first paint, and this decides whether to drive it.
 */
const IMMERSIVE = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/**
 * Where each panel of copy lives on the flight, as a range of world
 * progress. These are the other half of src/three/world/flightPath.ts: the
 * camera arrives at the first pack around 0.50, so the panel that names it
 * is centred there. Move a camera key and the matching band moves with it.
 */
const BANDS: Record<string, [number, number]> = {
  /* Starts before the world does, so the first panel is already up the
     moment the hero hands over rather than fading in from nothing */
  lineup: [-0.12, 0.21],
  /* The three statements overlap rather than butt together: read as one
     sentence in three parts, they should dissolve into each other. Butted
     bands leave the page blank for the width of one fade at each join. */
  story0: [0.19, 0.31],
  story1: [0.29, 0.39],
  story2: [0.37, 0.47],
  flavour0: [0.47, 0.59],
  flavour1: [0.62, 0.74],
  ritual: [0.77, 0.89],
  /* Runs past the end so the closing panel never fades back out */
  finale: [0.92, 1.08],
};

/** The rail down the side: one stop per act, so 760vh is still navigable */
const STOPS = [
  { key: "lineup", at: 0.02, label: "The lineup" },
  { key: "story", at: 0.3, label: "The story" },
  { key: "flavour0", at: 0.52, label: "Gobi Manchurian" },
  { key: "flavour1", at: 0.67, label: "3 in 1" },
  { key: "ritual", at: 0.83, label: "The ritual" },
  { key: "finale", at: 0.97, label: "The promise" },
];

const STATEMENTS = [
  "Born in Mangaluru's kitchens.",
  "Blended the way chefs blend.",
  "Cooked in yours, in minutes.",
];

const STEPS = [
  { number: "01", title: "Blend", copy: "Mix the masala with curd or water into a thick, clinging paste." },
  { number: "02", title: "Rest", copy: "Coat and let it sit for thirty minutes so the spice sinks deep." },
  { number: "03", title: "Fry", copy: "Into hot oil until golden and crisp. Garnish and serve hot." },
];

const PROMISES = [
  { title: "No artificial colors", copy: "The red comes from chillies." },
  { title: "No preservatives", copy: "Sealed fresh, nothing added." },
  { title: "No artificial flavors", copy: "Only ground spice and skill." },
];

interface HomeWorldProps {
  /** Only the products whose artwork has actually been supplied */
  packs: StagePack[];
  products: Product[];
}

/**
 * The whole home page below the hero, as one continuous flight through a
 * single 3D world rather than a stack of sections.
 *
 * The HTML here is the content: every word is in the server-rendered
 * markup and every link is a real link. The canvas behind it is pure
 * enhancement, so a browser without WebGL, a phone, or anyone who prefers
 * reduced motion gets the same copy laid out as an ordinary page — see the
 * media query above.
 */
export default function HomeWorld({ packs, products }: HomeWorldProps) {
  const router = useRouter();
  const worldRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [canvasOn, setCanvasOn] = useState(false);
  /* Whether the world is close enough to be worth drawing. See below. */
  const [awake, setAwake] = useState(false);
  /* Only relevant to the flat layout: whether the film may play itself */
  const [filmPlays, setFilmPlays] = useState(false);
  const filmRef = useRef<HTMLVideoElement>(null);

  /* The texture loader fetches the raw artwork files, so warm them the
     moment we know the world will mount rather than waiting for three.js */
  if (canvasOn) {
    for (const pack of packs) {
      preload(pack.front, { as: "image" });
      if (pack.back) preload(pack.back, { as: "image" });
    }
  }

  useEffect(() => {
    const query = window.matchMedia(IMMERSIVE);
    const decide = () => setCanvasOn(query.matches && supportsWebGL());
    decide();
    query.addEventListener("change", decide);
    return () => query.removeEventListener("change", decide);
  }, []);

  /*
   * The world sleeps until it is nearly on screen.
   *
   * It is one canvas for the whole page below the hero, and it used to start
   * drawing the moment it mounted — six walls of tiles, a video texture
   * re-uploaded every frame and a second copy of the film decoding, all of
   * it behind a hero nobody has scrolled past yet. The hero is a 720p film
   * playing inside a perspective with blur and blend over it, so the two
   * were spending the same GPU on the same frame and the picture the viewer
   * was actually looking at was the one that stuttered.
   *
   * How much warning it gets has to be read against the height of the hero
   * standing in front of it. A third of a screen was right while the hero
   * was several screens tall; against a hero that is exactly one screen
   * tall, the world's own top edge sits at the fold, so a third of a screen
   * of margin means the world is awake — canvas drawing, second decoder
   * running — from the moment the page loads, behind a hero nobody has
   * scrolled yet. That is the stutter this comment was written to prevent,
   * reintroduced by the hero shrinking.
   *
   * So the margin now pulls the other way: the world sleeps until it has
   * genuinely come into view. There is still a full screen of scrolling
   * before any of its content has to be right, which is all the warning it
   * ever needed, and while the hero is the whole picture the hero has the
   * GPU to itself.
   */
  useEffect(() => {
    const world = worldRef.current;
    if (!world || !canvasOn) return;

    const observer = new IntersectionObserver(
      ([entry]) => setAwake(entry.isIntersecting),
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(world);

    return () => observer.disconnect();
  }, [canvasOn]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const decide = () => setFilmPlays(query.matches);
    decide();
    query.addEventListener("change", decide);
    return () => query.removeEventListener("change", decide);
  }, []);

  /* React writes `muted` as an attribute, which a video that is already in
     the document ignores; without the property set, autoplay is refused. */
  useEffect(() => {
    if (filmRef.current) filmRef.current.muted = true;
  }, [canvasOn, filmPlays]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;

    const mm = gsap.matchMedia();

    mm.add(IMMERSIVE, () => {
      const beats = gsap.utils.toArray<HTMLElement>(`.${styles.beat}`);
      const dots = railRef.current
        ? gsap.utils.toArray<HTMLElement>(`.${styles.dot}`, railRef.current)
        : [];

      const paint = (p: number) => {
        worldState.progress = p;

        for (const beat of beats) {
          const band = BANDS[beat.dataset.beat ?? ""];
          if (!band) continue;
          const o = bandOpacity(p, band);
          beat.style.setProperty("--o", o.toFixed(3));
          /* Hidden rather than merely transparent, so a panel that is not
             on screen is also out of the tab order and off the screen
             reader's path instead of being an invisible trap. */
          beat.style.visibility = o > 0.02 ? "visible" : "hidden";
          beat.dataset.on = o > 0.55 ? "true" : "false";
        }

        let active = 0;
        for (let i = 0; i < STOPS.length; i += 1) {
          if (p >= STOPS[i].at - 0.06) active = i;
        }
        dots.forEach((dot, i) => {
          dot.dataset.on = i === active ? "true" : "false";
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: world,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
        /* The film only runs while the world is the part of the page
           being looked at */
        onToggle: (self) => {
          worldState.active = self.isActive;
        },
      });
      worldState.active = trigger.isActive;

      /* The pointer moves the camera, so it is tracked against the window
         rather than against any one panel. */
      const onPointer = (event: PointerEvent) => {
        worldState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        worldState.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const jump = (index: number) => {
        const stop = STOPS[index];
        scrollToOffset(trigger.start + (trigger.end - trigger.start) * stop.at);
      };
      const listeners = dots.map((dot, i) => {
        const handler = () => jump(i);
        dot.addEventListener("click", handler);
        return { dot, handler };
      });

      paint(trigger.progress);

      return () => {
        window.removeEventListener("pointermove", onPointer);
        for (const { dot, handler } of listeners) {
          dot.removeEventListener("click", handler);
        }
        trigger.kill();
        worldState.active = false;
        for (const beat of beats) {
          beat.style.removeProperty("--o");
          beat.style.visibility = "";
          delete beat.dataset.on;
        }
        worldState.progress = 0;
      };
    });

    return () => mm.revert();
  }, []);

  const explore = (product: Product) => (
    <Magnetic>
      <Link href={`/products/${product.slug}`} className={styles.cta}>
        Explore the pack
        <span aria-hidden="true" className={styles.ctaArrow}>
          &rarr;
        </span>
      </Link>
    </Magnetic>
  );

  return (
    <section
      id="products"
      ref={worldRef}
      className={styles.world}
      data-canvas={canvasOn ? "on" : "off"}
      aria-label="The RS Chef'z lineup, story and promise"
    >
      <Cursor />

      <div className={styles.viewport}>
        {canvasOn && (
          <div className={styles.canvas}>
            <WorldCanvas
              packs={packs}
              awake={awake}
              onSelect={(slug) => router.push(`/products/${slug}`)}
            />
          </div>
        )}

        {/* The world without WebGL: the same warm space, drawn in CSS */}
        <div className={styles.backdrop} aria-hidden="true">
          <span className={`${styles.glow} ${styles.glowTurmeric}`} />
          <span className={`${styles.glow} ${styles.glowChilli}`} />
          <span className={`${styles.glow} ${styles.glowGreen}`} />
        </div>

        <div className={styles.beats}>
          {/* ---------------------------------------------- the lineup */}
          <div className={styles.beat} data-beat="lineup">
            <div className={styles.panel}>
              <p className={styles.eyebrow}>The Lineup</p>
              <h2 className={styles.title}>Two packs. Every favourite.</h2>
              <p className={styles.sub}>
                Take a pack in hand and turn it around. The recipes live on
                the back.
              </p>

              <div className={styles.packShots}>
                {packs.map((pack) => (
                  <Link
                    key={pack.slug}
                    href={`/products/${pack.slug}`}
                    className={styles.packShot}
                    aria-label={`Explore ${pack.name}`}
                  >
                    <Image
                      src={pack.front}
                      alt={`${pack.name} pack`}
                      width={400}
                      height={560}
                      sizes="(max-width: 560px) 44vw, 240px"
                    />
                  </Link>
                ))}
              </div>

              <div className={styles.links}>
                {packs.map((pack) => (
                  <Magnetic key={pack.slug}>
                    <Link
                      href={`/products/${pack.slug}`}
                      className={styles.linkCard}
                      style={{ "--accent": pack.accent } as React.CSSProperties}
                    >
                      Explore {pack.name}
                      <span aria-hidden="true"> {"→"}</span>
                    </Link>
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>

          {/* The film itself, for the layout that has no world to put it
              in. In the immersive layout it is playing on the screens
              standing in the 3D world instead. */}
          {!canvasOn && (
            <div className={styles.filmBlock}>
              <video
                ref={filmRef}
                className={styles.film}
                src={FILM_SRC}
                poster={FILM_POSTER}
                width={1280}
                height={720}
                muted
                loop
                playsInline
                autoPlay={filmPlays}
                controls={!filmPlays}
                preload={filmPlays ? "metadata" : "none"}
              />
              <p className={styles.filmCaption}>
                From the pack to the plate, in one go.
              </p>
            </div>
          )}

          {/* ----------------------------------------------- the story */}
          {STATEMENTS.map((statement, index) => (
            <div
              key={statement}
              className={`${styles.beat} ${styles.beatCentre}`}
              data-beat={`story${index}`}
            >
              <p className={styles.statement}>{statement}</p>
            </div>
          ))}

          {/* --------------------------------------- one beat per pack */}
          {products.map((product, index) => (
            <div
              key={product.slug}
              className={`${styles.beat} ${index % 2 ? styles.beatRight : styles.beatLeft}`}
              data-beat={`flavour${index}`}
              style={{ "--accent": product.accentColor } as React.CSSProperties}
            >
              <div className={styles.panel}>
                <h2 className={styles.flavourTitle}>{product.name}</h2>
                <p className={styles.tagline}>{product.tagline}</p>
                <p className={styles.body}>{product.description}</p>
                <ul className={styles.chips} aria-label="Signature dishes">
                  {product.dishes.map((dish) => (
                    <li key={dish} className={styles.chip}>
                      {dish}
                    </li>
                  ))}
                </ul>
                {explore(product)}
              </div>

              <div className={styles.packShots}>
                <Link
                  href={`/products/${product.slug}`}
                  className={styles.packShot}
                  aria-label={`Explore ${product.name}`}
                >
                  <Image
                    src={product.images.front}
                    alt={`${product.name} pack`}
                    width={700}
                    height={850}
                    sizes="(max-width: 900px) 62vw, 380px"
                  />
                </Link>
              </div>
            </div>
          ))}

          {/* ---------------------------------------------- the ritual */}
          <div className={`${styles.beat} ${styles.beatCentre}`} data-beat="ritual">
            <div className={styles.panel}>
              <p className={styles.eyebrow}>The Ritual</p>
              <h2 className={styles.title}>Three steps. Zero guesswork.</h2>
              <p className={styles.sub}>
                Every pack carries the full recipe on the back. The short
                version never changes.
              </p>
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
          </div>

          {/* --------------------------------------------- the promise */}
          <div className={`${styles.beat} ${styles.beatCentre}`} data-beat="finale">
            <div className={`${styles.panel} ${styles.panelCard}`}>
              <p className={styles.eyebrow}>The Promise</p>
              <h2 className={styles.title}>
                Printed on every pack. Kept in every batch.
              </h2>
              <ul className={styles.cards}>
                {PROMISES.map((promise) => (
                  <li key={promise.title} className={styles.card}>
                    <span className={styles.badge} aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12.5 10 17.5 19 7" />
                      </svg>
                    </span>
                    <h3 className={styles.cardTitle}>{promise.title}</h3>
                    <p className={styles.cardCopy}>{promise.copy}</p>
                  </li>
                ))}
              </ul>
              {/* The brand signs its own promise: no second name here */}
              <p className={styles.footnote}>
                FSSAI licensed. Proudly a Product of India.
              </p>
            </div>
          </div>
        </div>

        {/* Where you are in the flight, and a way to skip to any of it */}
        <div className={styles.rail} ref={railRef} aria-hidden="true">
          {STOPS.map((stop) => (
            <button
              key={stop.key}
              type="button"
              className={styles.dot}
              /* A shortcut for the mouse, not a second navigation: the rail
                 is hidden from assistive tech, so it stays out of the tab
                 order too rather than being six unlabelled stops. */
              tabIndex={-1}
            >
              <span className={styles.dotLabel}>{stop.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
