"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BuyButtons from "@/components/ui/BuyButtons";
import { scrollToElement } from "@/components/layout/SmoothScroll";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = ["Where", "Every", "Dish", "Comes", "Alive"];

/**
 * Wide enough for the film, and nobody has asked for less motion. The
 * stylesheet keys the whole cinematic layout off this exact query, so the
 * two must stay in step.
 */
const CINEMATIC = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/** Beyond this the film is not worth holding in memory, so it is streamed. */
const MAX_INLINE_BYTES = 28 * 1024 * 1024;

/** How fast the picture closes on where the scroll says it should be. */
const PLAYHEAD_EASE = 0.22;

export interface HeroAssets {
  /** Local file when committed, Higgsfield CDN URL otherwise */
  videoSrc: string;
  posterSrc: string;
  /** Ambient sizzle loop. Absent until the owner drops the file in. */
  ambientSrc?: string;
}

/**
 * "A Feast in Motion".
 *
 * One continuous shot of the dishes, and the scroll wheel is the projector.
 * The plate rests, the food bursts upward and hangs in zero gravity, the
 * camera flies through it, and then every piece falls back and lands. Stop
 * scrolling and the food freezes mid-air; scroll back and it rebuilds itself
 * exactly in reverse, because the scroll position *is* the playhead rather
 * than something that merely triggers playback.
 *
 * The last quarter of the scroll runs the film backwards on purpose: the
 * reverse of an explosion is a perfect landing, so nothing has to be
 * animated twice and every ingredient returns to precisely where it began.
 *
 * The stage is a real 3D space rather than a stack of flat layers. The film
 * hangs a long way back inside a perspective, so the pointer swings it on
 * two axes while the type stays put in front of it, and the scroll walks it
 * forward through that space instead of merely scaling it up.
 *
 * Two numbers carry the whole thing. The stage gets `--p`, the raw scroll
 * progress, and the stylesheet derives the dolly, the vignette and the scrim
 * from it; the other is the film's playhead.
 *
 * Which of the two layouts applies is decided by a media query in the
 * stylesheet, not by this component, so the hero is already in its final
 * shape on the very first paint. The film then arrives into a stage that is
 * already the right size: it fades in over its own poster frame and picks up
 * the playhead, and nothing on screen moves to accommodate it. Phones and
 * readers who ask for reduced motion get the still frame, all the copy at
 * once, and a hero one screen tall.
 */
export default function Hero({
  assets,
  hasLogo = false,
}: {
  assets: HeroAssets;
  hasLogo?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = usePointerParallax<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  /** Where the scroll says the film should be, 0-1. Written every frame. */
  const playheadRef = useRef({ value: 0 });
  const [cinematic, setCinematic] = useState(false);
  const [wantsVideo, setWantsVideo] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [filmReady, setFilmReady] = useState(false);
  const [ambient, setAmbient] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(CINEMATIC);
    const update = () => setCinematic(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  /* The file is fetched on the first sign of intent rather than at first
     paint, with a short fallback so it is buffered before anyone reaches it. */
  useEffect(() => {
    if (!cinematic) return;

    let armed = false;
    const events = ["scroll", "wheel", "touchmove", "pointerdown"] as const;

    const arm = () => {
      if (armed) return;
      armed = true;
      window.clearTimeout(timer);
      events.forEach((type) => window.removeEventListener(type, arm));
      setWantsVideo(true);
    };

    const timer = window.setTimeout(arm, 1200);
    events.forEach((type) =>
      window.addEventListener(type, arm, { passive: true }),
    );

    return () => {
      window.clearTimeout(timer);
      events.forEach((type) => window.removeEventListener(type, arm));
    };
  }, [cinematic]);

  /*
   * Scrubbing needs random access to the whole film, and a stream cannot
   * give it: every seek becomes a range request, a scroll asks for them far
   * faster than the network can answer, and the picture ends up stuck on
   * whichever frame arrived last. So the file is pulled down once and the
   * element is handed a blob, after which every seek is local and instant.
   *
   * If the host will not serve it to a fetch, or the file is too heavy to
   * keep in memory, this falls back to streaming the URL directly — slower
   * to become scrubbable, but never worse than before.
   */
  useEffect(() => {
    if (!wantsVideo) return;

    const direct = assets.videoSrc;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    let live = true;

    fetch(direct, { signal: controller.signal, credentials: "omit" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Number(response.headers.get("content-length") ?? 0);
        if (bytes > MAX_INLINE_BYTES) throw new Error("too large to hold");
        return response.blob();
      })
      .then((blob) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      })
      .catch(() => {
        if (live) setSource(direct);
      });

    return () => {
      live = false;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [wantsVideo, assets.videoSrc]);

  /*
   * Ready means the whole film can be seeked without the network in the
   * loop, not merely that a first frame turned up. Handing the playhead
   * over at `loadeddata`, as this used to, is what left the picture stuck
   * part of the way down the page.
   */
  const checkReady = useCallback((video: HTMLVideoElement) => {
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      setFilmReady(true);
      return;
    }
    const { buffered, duration } = video;
    if (!Number.isFinite(duration) || duration === 0) return;
    if (buffered.length === 0) return;
    if (buffered.start(0) <= 0.05 && buffered.end(0) >= duration - 0.25) {
      setFilmReady(true);
    }
  }, []);

  /* Safari will not seek a video that has never played. Start it and stop
     it again immediately, while it is still muted and showing frame zero. */
  const prime = useCallback((video: HTMLVideoElement) => {
    void video
      .play()
      .then(() => video.pause())
      .catch(() => {});
  }, []);

  /*
   * The scroll says where the film should be; this is what actually moves
   * it, and it is deliberately not wired straight into the scroll handler.
   * Only one seek is ever in flight, because a decoder cannot answer them
   * as fast as a scroll can ask and the backlog is what looks like a frozen
   * video. And it eases toward the target rather than snapping to it, which
   * is what turns a scrubbed file into a camera move.
   */
  useEffect(() => {
    if (!filmReady) return;
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let shown = playheadRef.current.value;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const length = video.duration;
      if (!Number.isFinite(length) || length === 0) return;

      shown += (playheadRef.current.value - shown) * PLAYHEAD_EASE;
      if (video.seeking) return;

      /* Clear of the very end, which some browsers refuse to seek to */
      const target = Math.min(shown * length, length - 0.05);
      if (Math.abs(video.currentTime - target) < 0.02) return;
      video.currentTime = target;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [filmReady]);

  /*
   * Tells the floating navigation to switch to dark glass while this section
   * is under it. Set imperatively rather than in JSX so the scroll timeline
   * can flip it off for the closing wash without a re-render putting it back.
   */
  useEffect(() => {
    sectionRef.current?.setAttribute("data-dark-section", "true");
  }, []);

  /* Opening beat, on load: scene one settles into place. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        `.${styles.eyebrow}`,
        { y: 22, autoAlpha: 0, letterSpacing: "0.62em" },
        { y: 0, autoAlpha: 1, letterSpacing: "0.34em", duration: 1.3 },
        0.2,
      );

      tl.fromTo(
        `.${styles.storyLine}`,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.4 },
        0.4,
      );

      tl.fromTo(
        `.${styles.word}`,
        { yPercent: 116, rotate: 3, autoAlpha: 0 },
        {
          yPercent: 0,
          rotate: 0,
          autoAlpha: 1,
          duration: 1.3,
          stagger: 0.07,
        },
        0.62,
      );

      tl.fromTo(
        `.${styles.sub}`,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1 },
        "-=0.75",
      );

      tl.fromTo(
        `.${styles.explore}`,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9 },
        "-=0.65",
      );

      tl.fromTo(
        `.${styles.cue}`,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.9 },
        "-=0.4",
      );
    }, stageRef);

    return () => ctx.revert();
  }, [stageRef]);

  /*
   * The storyboard, wired to the scroll bar: scene 1 arrival 0-20%, scene 2
   * explosion 20-50%, scene 3 rotation 50-75%, scene 4 rebuild 75-100%.
   *
   * Built once, whether or not the film has landed. The playhead legs write
   * into a ref that nothing reads until the file is scrubbable, so the video
   * arriving never tears this timeline down and rebuilds it mid-scroll. The
   * poster alone already carries the dolly, the vignette and every copy
   * beat, so the hero is never a dead stretch while the video downloads.
   */
  useEffect(() => {
    if (!cinematic) return;

    const ctx = gsap.context(() => {
      const stage = stageRef.current;
      const playhead = playheadRef.current;
      const progress = { value: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          /* Long enough that the picture glides rather than tracks the
             wheel notch for notch, short enough to still feel driven. */
          scrub: 0.55,
        },
      });

      /* Raw progress for the stylesheet: dolly, vignette, scrim, wash */
      tl.to(
        progress,
        {
          value: 1,
          duration: 1,
          onUpdate: () => {
            stage?.style.setProperty("--p", progress.value.toFixed(4));
            /* Hand the navigation back to its light glass just before the
               wash turns this section cream underneath it */
            sectionRef.current?.setAttribute(
              "data-dark-section",
              progress.value < 0.93 ? "true" : "false",
            );
          },
        },
        0,
      );

      /* Arrival: the camera creeps in while the plate sits still */
      tl.to(playhead, { value: 0.18, duration: 0.2 }, 0);
      /* Explosion: the food leaves the plate and separates */
      tl.to(playhead, { value: 0.52, duration: 0.3, ease: "power1.in" }, 0.2);
      /* Rotation: the camera flies through what is hanging there */
      tl.to(playhead, { value: 1, duration: 0.25 }, 0.5);
      /* Rebuild: the same move backwards, easing into the landing */
      tl.to(playhead, { value: 0.18, duration: 0.25, ease: "power2.out" }, 0.75);

      /* The title card steps aside as the plate starts to come apart */
      tl.to(`.${styles.storyLine}`, { autoAlpha: 0, y: -30, duration: 0.1 }, 0.14);
      tl.to(`.${styles.cue}`, { autoAlpha: 0, duration: 0.05 }, 0.1);

      /* The sub steps back for scene 3 so the food can fill the screen.
         From here the headline is the only copy the macro shots share. */
      tl.to(`.${styles.sub}`, { autoAlpha: 0, y: -18, duration: 0.08 }, 0.56);

      /* Scene 4: the copy lifts, the walking CTA hands over to the sign-off */
      tl.to(`.${styles.explore}`, { autoAlpha: 0, y: -14, duration: 0.06 }, 0.72);
      tl.to(`.${styles.copy}`, { y: -54, duration: 0.16 }, 0.74);
      tl.fromTo(
        `.${styles.finale}`,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.8,
      );

      /* The film washes out to the cream the rest of the page is built on,
         so the bright site underneath is already there when it slides up */
      tl.fromTo(
        `.${styles.exit}`,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05 },
        0.95,
      );
    }, stageRef);

    /* Fonts, artwork and the packs above the fold all settle at their own
       pace, and every section below this one measures from the bottom of a
       hero several screens tall. Re-measure once it is standing. */
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [cinematic, stageRef]);

  /* Muted by default and never autoplayed: the toggle is the consent. */
  const toggleAmbient = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (ambient) {
      audio.pause();
      setAmbient(false);
      return;
    }
    audio.volume = 0.28;
    void audio.play().then(
      () => setAmbient(true),
      () => setAmbient(false),
    );
  }, [ambient]);

  const explore = useCallback(() => {
    scrollToElement(
      document.getElementById("products") ??
        sectionRef.current?.nextElementSibling ??
        null,
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-film={filmReady ? "true" : "false"}
      aria-label="RS Chef'z"
    >
      <div ref={stageRef} className={styles.stage}>
        {/* The shot, hung deep inside the stage's perspective */}
        <div className={styles.scene} aria-hidden="true">
          <div className={styles.film}>
            <Image
              className={styles.plate}
              src={assets.posterSrc}
              alt=""
              fill
              priority
              sizes="100vw"
            />
            {source && (
              <video
                ref={videoRef}
                className={`${styles.plate} ${styles.video}`}
                data-ready={filmReady ? "true" : "false"}
                src={source}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(event) => prime(event.currentTarget)}
                onProgress={(event) => checkReady(event.currentTarget)}
                onCanPlayThrough={(event) => checkReady(event.currentTarget)}
              />
            )}
          </div>

          {/* Steam keeps rising whether or not anyone is scrolling */}
          <div className={styles.steam}>
            <span className={styles.plume} />
            <span className={styles.plume} />
            <span className={styles.plume} />
          </div>

          <div className={styles.flare} />
          <div className={styles.vignette} />
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>RS Chef&apos;z Masalas</p>
          <p className={styles.storyLine}>Every Bite Has a Story.</p>
          <h1 className={styles.headline}>
            {HEADLINE.map((word) => (
              <span key={word} className={styles.mask}>
                <span
                  className={`${styles.word} ${
                    word === "Alive" ? styles.wordAccent : ""
                  }`}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <p className={styles.sub}>
            Fresh ingredients. Bold spices. Authentic flavors. Crafted to
            delight every craving.
          </p>
          <button type="button" className={styles.explore} onClick={explore}>
            Explore the Menu
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="m5 12 7 7 7-7" />
            </svg>
          </button>
        </div>

        {/* Scene 4: the dish has landed, so the brand signs it off */}
        <div className={styles.finale}>
          {hasLogo ? (
            <Image
              className={styles.finaleLogo}
              src="/assets/brand/logo.png"
              alt="RS Chef'z"
              width={1000}
              height={426}
              sizes="180px"
            />
          ) : (
            <p className={styles.finaleMark}>RS Chef&apos;z</p>
          )}
          <BuyButtons className={styles.finaleCtas} />
        </div>

        <div className={styles.cue} aria-hidden="true">
          <span className={styles.cueDot} />
          <span className={styles.cueLabel}>Scroll to play</span>
        </div>

        {assets.ambientSrc && (
          <>
            <audio ref={audioRef} src={assets.ambientSrc} loop preload="none" />
            <button
              type="button"
              className={styles.sound}
              onClick={toggleAmbient}
              aria-pressed={ambient}
              aria-label={
                ambient ? "Mute kitchen ambience" : "Play kitchen ambience"
              }
            >
              <span className={styles.soundBars} data-on={ambient}>
                <span />
                <span />
                <span />
              </span>
            </button>
          </>
        )}

        <div className={styles.exit} aria-hidden="true" />
      </div>
    </section>
  );
}
