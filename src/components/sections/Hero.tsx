"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
import { HERO_BRAND_EVENT, HERO_OPEN_EVENT } from "@/utils/heroOpen";
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
  /** The brand mark, if it has been supplied. Absent, the intro simply has
      no logo in it and the bar keeps its wordmark from the start. */
  logoSrc?: string;
}

/**
 * The page starts the film downloading from an inline script, before this
 * bundle exists, using a video element that never enters the document (see
 * `WARM_FILM` in `app/page.tsx`). Once the real element has a frame of its
 * own, that one is holding a second buffer of the same film for nothing.
 */
function releaseWarmFilm() {
  const held = window as Window & { __warmFilm?: HTMLVideoElement };
  if (held.__warmFilm) {
    held.__warmFilm.removeAttribute("src");
    delete held.__warmFilm;
  }
}

/**
 * The intro's beats, in seconds.
 *
 * The film does not grow. It opens at the size it will keep, because that
 * size is the composition — the shape, the rings around it and the logo
 * standing in the middle of it are the picture the page opens on, and a
 * picture that swells for three seconds is not that picture. The rings and
 * the orange are the opening's own; they close together on the centre. What
 * carries into the hero is the film, unmoved, and the mark, which flies up
 * into the bar.
 */
const BEAT = {
  /** the orange sheet starts collapsing */
  wipe: 1.6,
  /** the room is the hero's; the bar may come down, the logo sets off */
  handover: 2.2,
  /** the buttons arrive */
  actions: 2.4,
  /** everything the intro owned can go */
  end: 3.7,
} as const;

/** How long the logo is in the air, in seconds. */
const FLIGHT = 1.15;

/**
 * The rings. Concentric offsets of the film's own outline, pushing outward
 * past the edges of the room.
 *
 * They belong to the opening and to nothing else. The layer is painted on
 * the orange sheet and clipped to whatever is left of it, so when the sheet
 * closes on the centre the rings close with it — they leave by the same
 * door the orange does, in the same second, rather than being faded out
 * separately or left running under a finished hero.
 *
 * The hero the visitor is left standing in has no rings in it at all: paper,
 * the words crossing it, the herbs, and the film.
 */
const RING_COUNT = 5;

function Rings() {
  return (
    <div className={styles.rings} aria-hidden="true">
      {Array.from({ length: RING_COUNT }, (_, index) => (
        <span key={index} className={styles.ring} />
      ))}
    </div>
  );
}

/**
 * Where an element in the header will be standing once the bar has finished
 * coming down.
 *
 * The bar enters from above, so its brand's box during the intro is
 * wherever the slide has got to. Taking the bar's own translation back off
 * gives the box it is heading for, whether it has not started moving yet or
 * is halfway through — which is what the flying logo has to aim at.
 */
function restingBox(el: HTMLElement): DOMRect {
  const box = el.getBoundingClientRect();
  const bar = el.closest("header");
  const applied = bar ? getComputedStyle(bar).transform : "none";
  if (!applied || applied === "none") return box;
  try {
    const matrix = new DOMMatrixReadOnly(applied);
    return new DOMRect(
      box.left - matrix.e,
      box.top - matrix.f,
      box.width,
      box.height,
    );
  } catch {
    return box;
  }
}

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
 * The three inks the words are printed in, in the order they cycle: the
 * brand's exact orange, its exact red, and one word in three drawn as an
 * outline rather than filled.
 */
const INKS = ["ember", "red", "line"] as const;

/**
 * One pass of a band's words. Printed twice per row, so half the row's
 * width is exactly one pass and the loop has no seam — which is also why
 * both passes take the same offset and come out identical.
 *
 * The row's own index shifts where in the cycle it opens, so all three inks
 * are on screen at once and no two rows put the same one in a column.
 */
function BandRun({ row, offset }: { row: string[]; offset: number }) {
  return (
    <span className={styles.bandRun} aria-hidden="true">
      {row.map((word, index) => (
        <span
          key={word}
          className={styles.bandWord}
          data-ink={INKS[(index + offset) % INKS.length]}
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
 * orange with the kitchen film already running inside an organic shape, the
 * brand mark standing in the middle of it, and thin outline rings pushing
 * outward past it to the edges of the room. Then the orange collapses
 * inward, taking the rings with it, the logo flies up into the navigation
 * bar, and what is left standing there is the hero.
 *
 * Nothing in that is a fade or a cut. The film is one element at one size
 * throughout — the intro does not grow it and does not hand over to a second
 * player, so the frame playing at 0.0 is the frame playing at the end. The
 * logo is one element that travels. The only thing that actually happens is
 * that the orange leaves.
 *
 * What it leaves behind is deliberately quiet: paper, the words, the herbs
 * and the film. The rings are the opening's, and they go home with it.
 *
 * That is why the film lives in the hero rather than in the intro. An intro
 * that owns its own video has to hand over to a second one, and a second
 * one is a second decoder, a second buffer, and a visible jump at the join.
 *
 * Behind it, giant words in the brand's orange cross the room forever, herbs and seed
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
  const maskRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
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
        /*
         * And the room stands down with it.
         *
         * The words crossing the hero, the herbs drifting through it and the
         * shape's own morph are compositor animations, which is to say they
         * are cheap — but they are cheap *per frame*, and they keep asking
         * for frames long after the hero has gone off the top of the window.
         * The 3D world below is drawing by then, and it wants every one of
         * those frames. So the whole hero holds still while nobody is
         * looking at it, and picks up exactly where it left off when it
         * comes back: `animation-play-state` pauses a clock, it does not
         * rewind one.
         */
        section.dataset.live = onScreen ? "true" : "false";
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

    const mask = maskRef.current;
    const intro = introRef.current;
    if (!mask || !intro) return;

    /* A reload restores the old scroll position, and an intro that opens
       halfway down the page is an intro nobody sees. */
    window.scrollTo(0, 0);
    setScrollLocked(true);

    const wipe = { value: 118 };

    const ctx = gsap.context(() => {
      gsap.set(`.${styles.action}`, { y: 30, autoAlpha: 0 });

      const tl = gsap.timeline();

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

      /*
       * The brand reveal.
       *
       * The logo opens standing in the middle of the film, at a size read
       * off the film itself, and lands in the bar's own brand slot, at a
       * size read off that. Both ends are measured rather than written
       * down: the film's box is whatever the breakpoint made it, and the
       * bar's mark is whatever it is set in. Nothing here can drift out of
       * agreement with either of them.
       *
       * The light behind it goes first, over the opening half of the
       * flight, so what arrives in the bar is the artwork on its own.
       *
       * Everything is one uniform scale on one element, so the mark never
       * distorts and never re-rasterises mid-flight. It is composited, the
       * bar is composited, and the film underneath is untouched by all of
       * it.
       */
      const fly = flyRef.current;
      const glow = glowRef.current;
      const slot = document.querySelector<HTMLElement>("[data-brand-anchor]");
      const film = mask.getBoundingClientRect();
      let landed = BEAT.handover;

      if (fly && slot) {
        const wide = fly.offsetWidth;
        const tall = fly.offsetHeight;
        /* Roughly the proportion the reference gives its wordmark: a little
           under half the width of the picture it stands on. */
        const from = (film.width * 0.44) / wide;
        const rest = restingBox(slot);
        const to = rest.width / wide;

        gsap.set(fly, {
          transformOrigin: "0 0",
          x: film.left + (film.width - wide * from) / 2,
          y: film.top + (film.height - tall * from) / 2,
          scale: from,
        });

        landed = BEAT.handover + FLIGHT;

        tl.to(
          fly,
          {
            x: rest.left + (rest.width - wide * to) / 2,
            y: rest.top + (rest.height - tall * to) / 2,
            scale: to,
            filter: "drop-shadow(0px 0px 0px rgba(58, 28, 10, 0))",
            duration: FLIGHT,
            ease: "power3.inOut",
          },
          BEAT.handover,
        );

        if (glow) {
          tl.to(
            glow,
            { autoAlpha: 0, duration: FLIGHT * 0.55, ease: "power2.in" },
            BEAT.handover,
          );
        }

        /* The bar's own mark comes up as this one goes down, both standing
           on the same box at the same size. A hard swap would show every
           sub-pixel of disagreement between them; a third of a second of
           overlap shows none. */
        tl.to(fly, { autoAlpha: 0, duration: 0.3, ease: "none" }, landed);
      }

      tl.add(() => window.dispatchEvent(new Event(HERO_BRAND_EVENT)), landed);

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
        /* Backstop for the warm-up element, in case the film never reached
           `loadeddata` — by now the hero's own player has been fetching for
           three seconds and nothing is waiting on the warm copy. */
        releaseWarmFilm();
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

      {/* Scenery: huge words in the room's own orange, crossing it forever */}
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
          <Rings />
        </div>
      )}

      {/* The film. One element at one size for the intro and everything
          after it — the intro never touches this, it only takes the orange
          away from around it. */}
      <div className={styles.stage}>
        <div className={styles.shift}>
          <div ref={maskRef} className={styles.mask}>
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
                onLoadedData={() => {
                  setFilmReady(true);
                  releaseWarmFilm();
                }}
              />
            )}
            <span className={styles.grade} />
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

      {/*
        The travelling mark.

        Portalled to the body because it has to end up on top of the
        navigation bar, and the hero is a stacking context of its own that
        the bar is not inside — an element in here, at any z-index at all,
        still paints under it. Fixed rather than absolute for the same
        reason the bar is: the two of them have to agree about where the
        viewport is.
      */}
      {mode === "intro" && !introDone && assets.logoSrc &&
        createPortal(
          <div ref={flyRef} className={styles.brandFly} aria-hidden="true">
            <span ref={glowRef} className={styles.brandGlow} />
            <Image
              className={styles.brandArt}
              src={assets.logoSrc}
              alt=""
              width={1000}
              height={426}
              priority
              sizes="320px"
            />
          </div>,
          document.body,
        )}
    </section>
  );
}
