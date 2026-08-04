"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import {
  scrollToElement,
  setScrollLocked,
} from "@/components/layout/SmoothScroll";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { HERO_OPEN_EVENT } from "@/utils/heroOpen";
import styles from "./Hero.module.css";

/**
 * The intro's opening frame is set from script, one tick before the browser
 * paints, so there is never a frame of the finished hero in front of it.
 * That has to be a layout effect, and a layout effect on the server is a
 * warning about nothing.
 */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface HeroAssets {
  videoSrc: string;
  posterSrc: string;
}

/**
 * The intro's beats, in seconds.
 */
const BEAT = {
  /** the shape starts to creep outward */
  creep: 0.8,
  /** it stops creeping and opens out */
  open: 2.4,
  /** the orange sheet starts collapsing behind it */
  wipe: 2.5,
  /** the room is the hero's; the bar may come down */
  handover: 2.95,
  /** the buttons arrive */
  actions: 3.05,
  /** everything the intro owned can go */
  end: 3.7,
} as const;

/**
 * Words that drift across the room behind the film. Three rows, each read
 * as one long line and printed twice so the loop has no seam.
 */
const BANDS = [
  ["Authentic Flavours", "Restaurant Style", "Ground Fresh"],
  ["Chef'z Special", "Signature Blends", "Slow Roasted"],
  ["Fresh Ingredients", "Bold Spice", "Made in Mangaluru"],
];

/** Herbs and spice hanging in the air, by depth. Nearest layer last. */
const AIR = [
  [
    { kind: styles.leaf, at: { top: "17%", left: "8%" } },
    { kind: styles.chilli, at: { top: "69%", left: "12%" } },
    { kind: styles.seed, at: { top: "33%", right: "10%" } },
    { kind: styles.leaf, at: { top: "79%", right: "15%" } },
  ],
  [
    { kind: styles.seed, at: { top: "11%", left: "25%" } },
    { kind: styles.leaf, at: { top: "57%", right: "5%" } },
    { kind: styles.chilli, at: { top: "23%", right: "26%" } },
  ],
  [
    { kind: styles.leaf, at: { top: "83%", left: "30%" } },
    { kind: styles.seed, at: { top: "73%", right: "32%" } },
    { kind: styles.chilli, at: { top: "7%", left: "47%" } },
  ],
];

/**
 * One pass of a band's words. Printed twice per row, so half the row's
 * width is exactly one pass and the loop has no seam.
 *
 * The words alternate between drawn and plain, and the row's own index
 * shifts which of the two a row opens on, so no two rows sit their solid
 * words in a column.
 */
function BandRun({ row, offset }: { row: string[]; offset: number }) {
  return (
    <span className={styles.bandRun} aria-hidden="true">
      {row.map((word, index) => (
        <span
          key={word}
          className={styles.bandWord}
          data-ink={(index + offset) % 2 ? "plain" : "line"}
        >
          {word} —
        </span>
      ))}
    </span>
  );
}

/**
 * The opening film.
 *
 * The page does not begin on the hero. It begins on a sheet of restaurant
 * orange with the kitchen film already running inside a small organic
 * shape, thin outline rings pushing outward past it. Over three seconds the
 * shape creeps, then opens out, and the orange collapses inward behind it
 * until there is none of it left to see — and what is standing there is the
 * hero. No fade and no cut: the same element, grown, and the same decoder,
 * never restarted, so the film that was playing through the intro is still
 * playing at the same frame when the hero arrives.
 *
 * That is why the film lives in the hero rather than in the intro. An intro
 * that owns its own video has to hand over to a second one, and a second
 * one is a second decoder, a second buffer, and a visible jump at the join.
 *
 * Behind it, giant outlined words cross the room forever, herbs and seed
 * hang at three depths and swing with the pointer, and the shape itself
 * never stops morphing. All of it is transform and opacity on layers the
 * compositor already owns: one decoder, no canvas, no per-frame readback,
 * nothing measured during a scroll.
 *
 * The hero is exactly one screen tall. Everything below it is the world.
 *
 * The stylesheet describes the *finished* hero and nothing else, so a first
 * paint that script never reaches — reduced motion, a failed bundle — is an
 * ordinary still hero rather than an intro stuck at frame one. The opening
 * frame is written by script in a layout effect, before the browser has
 * painted anything, which is why there is no flash of the hero in front of
 * its own intro.
 */
export default function Hero({ assets }: { assets: HeroAssets }) {
  const sectionRef = usePointerParallax<HTMLElement>();
  const shapeRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [filmReady, setFilmReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  /**
   * "pending" is the server's answer and the answer script never reaches:
   * the still hero. The real one is decided before the first paint.
   */
  const [mode, setMode] = useState<"pending" | "intro" | "still">("pending");

  useIsoLayoutEffect(() => {
    setMode(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "still"
        : "intro",
    );
  }, []);

  /*
   * Keeping the picture moving.
   *
   * A muted, looping film needs nothing from us to run, and the element's
   * own `autoplay` covers the ordinary case. What it does not cover is a
   * browser that refused the first attempt, or one that suspended the
   * element while the tab was in the background. Both leave it paused, and
   * both are answered by asking it to play again.
   *
   * Nothing here touches the playhead, and nothing reloads the element. A
   * film that is buffering resumes on its own; seeking it, or loading it
   * out from under itself, throws away the decoder's work and freezes the
   * picture for longer than the stall being cured — a watchdog that fires
   * on a healthy film is indistinguishable from the fault it was written
   * for.
   *
   * The film also stands down before the hero has fully left. The world
   * below wakes while some of the hero is still on screen, and a second
   * 720p decoder feeding a video texture at 60Hz is exactly what makes the
   * picture in front of the viewer start dropping frames.
   */
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    /* React writes `muted` as an attribute, which an element already in
       the document ignores — and without the property, autoplay is refused
       and the intro opens on a frozen frame. */
    video.muted = true;

    const play = () => void video.play().catch(() => {});

    let onScreen = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.intersectionRatio > 0.4;
        if (onScreen) play();
        else video.pause();
      },
      { threshold: [0, 0.4, 0.95] },
    );
    observer.observe(section);

    const resume = () => {
      if (onScreen && !document.hidden && video.paused) play();
    };

    document.addEventListener("visibilitychange", resume);
    const watchdog = window.setInterval(resume, 1000);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      window.clearInterval(watchdog);
    };
  }, [mode, sectionRef]);

  /*
   * The intro, start to finish.
   *
   * Runs before the first paint: the opening frame — small shape, buttons
   * parked below their line — is written here rather than in the
   * stylesheet, so the hero the stylesheet describes is the one anybody who
   * never gets here still sees.
   */
  useIsoLayoutEffect(() => {
    if (mode !== "intro") return;

    const shape = shapeRef.current;
    const intro = introRef.current;
    if (!shape || !intro) return;

    /* A reload restores the old scroll position, and an intro that opens
       halfway down the page is an intro nobody sees. */
    window.scrollTo(0, 0);
    setScrollLocked(true);

    const wipe = { value: 118 };

    const ctx = gsap.context(() => {
      gsap.set(shape, { scale: 0.3 });
      gsap.set(`.${styles.action}`, { y: 30, autoAlpha: 0 });

      const tl = gsap.timeline();

      /* Creep, then open. Two moves rather than one, because a shape that
         grows at a steady rate for three seconds reads as a progress bar,
         and one that sits still and then bursts reads as a reveal. */
      tl.to(shape, { scale: 0.46, duration: 1.6, ease: "power1.inOut" }, BEAT.creep);
      tl.to(shape, { scale: 1, duration: 0.95, ease: "power3.inOut" }, BEAT.open);

      /* The orange collapses into the shape rather than fading off it. The
         sheet is a circle closing on the centre, and every part of it still
         visible is the part outside the film; once the circle is smaller
         than the film there is no orange left on screen. The shape has
         taken the room without a frame of crossfade. */
      tl.to(
        wipe,
        {
          value: 0,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () =>
            intro.style.setProperty("--wipe", `${wipe.value.toFixed(2)}%`),
        },
        BEAT.wipe,
      );

      tl.add(
        () => window.dispatchEvent(new Event(HERO_OPEN_EVENT)),
        BEAT.handover,
      );

      tl.to(
        `.${styles.action}`,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          /* Hand the buttons back to the stylesheet: an inline transform
             left behind here would outrank the hover lift forever. */
          onComplete: () =>
            gsap.set(`.${styles.action}`, {
              clearProps: "transform,opacity,visibility",
            }),
        },
        BEAT.actions,
      );

      tl.add(() => {
        setScrollLocked(false);
        setIntroDone(true);
      }, BEAT.end);
    }, sectionRef);

    return () => {
      setScrollLocked(false);
      ctx.revert();
    };
  }, [mode, sectionRef]);

  const explore = useCallback(() => {
    scrollToElement(
      document.getElementById("products") ??
        sectionRef.current?.nextElementSibling ??
        null,
    );
  }, [sectionRef]);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      aria-label="RS Chef'z"
    >
      {/* The page needs a heading and the hero has no room for one: the
          brand is the header, and the words behind the film are scenery. */}
      <h1 className={styles.srOnly}>
        {siteConfig.name} — {siteConfig.tagline}
      </h1>

      {/* Scenery: huge outlined words crossing the room, forever */}
      <div className={styles.bands} aria-hidden="true">
        {BANDS.map((row, index) => (
          <div key={index} className={styles.band} data-row={index}>
            <BandRun row={row} offset={index} />
            <BandRun row={row} offset={index} />
          </div>
        ))}
      </div>

      {/* Herbs and seed at three depths, each drifting on its own and the
          whole layer swinging with the pointer */}
      <div className={styles.air} aria-hidden="true">
        {AIR.map((layer, depth) => (
          <div key={depth} className={styles.airLayer} data-depth={depth}>
            {layer.map((bit, index) => (
              <span
                key={index}
                className={`${styles.bit} ${bit.kind}`}
                style={bit.at}
              />
            ))}
          </div>
        ))}
      </div>

      {/* The intro sheet: behind the film from the first frame, and gone by
          the time the film has finished opening */}
      {mode === "intro" && !introDone && (
        <div ref={introRef} className={styles.intro} aria-hidden="true">
          <div className={styles.wash} />
          <div className={styles.rings}>
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
          </div>
        </div>
      )}

      {/* The film. One element for the whole three seconds and everything
          after them — the intro grows this, it does not hand over to it. */}
      <div className={styles.stage}>
        <div ref={shapeRef} className={styles.shape}>
          <div className={styles.shift}>
            <div className={styles.mask}>
              <Image
                className={styles.frame}
                src={assets.posterSrc}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 84vw, 92vw"
              />
              {mode === "intro" && (
                <video
                  ref={videoRef}
                  className={`${styles.frame} ${styles.video}`}
                  data-ready={filmReady ? "true" : "false"}
                  src={assets.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  /* Not `canplaythrough`: the picture only has to cross
                     over its own frame zero, so the moment there is a frame
                     to show is the moment to show it. */
                  onLoadedData={() => setFilmReady(true)}
                />
              )}
              <span className={styles.grade} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={explore}>
          Explore Menu
        </button>
        <Link className={styles.action} href={`/products/${products[0].slug}`}>
          Our Masalas
        </Link>
        <a
          className={styles.action}
          href={siteConfig.amazonStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Order Online
        </a>
      </div>
    </section>
  );
}
