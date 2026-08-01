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

export interface HeroAssets {
  videoSrc: string;
  posterSrc: string;
  /** Ambient sizzle loop. Absent until the owner drops the file in. */
  ambientSrc?: string;
}

/**
 * "A Feast in Motion".
 *
 * The kitchen film plays, on its own, at its own speed: the gobi hangs over
 * the plate, the sachet opens, the masala goes on, it fries, and both packs
 * land behind both finished plates. It loops, and it never waits to be
 * driven — a cooking film is a performance, and the scroll is not what
 * should be performing it.
 *
 * The scroll still does plenty; it just does it to the room rather than to
 * the footage. The stage is a real 3D space rather than a stack of flat
 * layers: the film hangs a long way back inside a perspective, so the
 * pointer swings it on two axes while the type stays put in front of it,
 * and the scroll walks it forward through that space instead of merely
 * scaling it up. One number carries all of it — the stage gets `--p`, the
 * raw scroll progress, and the stylesheet derives the dolly, the vignette,
 * the scrim and the closing wash from it, while the copy beats hand over
 * along the same timeline.
 *
 * The tiled wall of this same film is the world below the hero, not this
 * section: here it is the footage itself, played whole.
 *
 * Which of the two layouts applies is decided by a media query in the
 * stylesheet, not by this component, so the hero is already in its final
 * shape on the very first paint. The film then arrives into a stage that is
 * already the right size: it fades in over its own poster frame and starts
 * running, and nothing on screen moves to accommodate it. Phones and
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
  const [cinematic, setCinematic] = useState(false);
  const [wantsVideo, setWantsVideo] = useState(false);
  const [filmReady, setFilmReady] = useState(false);
  const [ambient, setAmbient] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(CINEMATIC);
    const update = () => setCinematic(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  /* The film is asked for on the first sign of intent rather than at first
     paint, so it is not competing with the fonts and the poster for the
     opening second — with a short fallback, because a hero that waits for a
     gesture that never comes is a hero nobody sees move. */
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

    /* Half a second of stillness is intent enough. The film is small, but
       waiting any longer to start fetching it is what a viewer would later
       experience as the video "not loading". */
    const timer = window.setTimeout(arm, 500);
    events.forEach((type) =>
      window.addEventListener(type, arm, { passive: true }),
    );

    return () => {
      window.clearTimeout(timer);
      events.forEach((type) => window.removeEventListener(type, arm));
    };
  }, [cinematic]);

  /*
   * Keeping the picture moving.
   *
   * A muted, looping film needs nothing from us to run, and the element's
   * own `autoplay` covers the ordinary case. Three cases it does not:
   *
   *  - a browser that refused the first attempt but will take one after the
   *    gesture that armed the fetch;
   *  - the stretch of page after the hero, where a decoder running behind a
   *    section nobody is looking at is a battery bill for a picture that is
   *    not on screen;
   *  - and a film that has quietly stopped. A video element does not report
   *    that. It goes on saying it is playing while the frame on screen is
   *    the same one it was a second ago, whether the pipeline lost its
   *    decoder, the network went quiet mid-buffer, or the machine simply
   *    ran out of room for both this and the world below. So rather than
   *    trust the element, watch the clock it is supposed to be advancing.
   */
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    /* React writes `muted` as an attribute, which an element already in the
       document ignores — and without the property, autoplay is refused and
       the hero holds its poster forever. */
    video.muted = true;

    const play = () => void video.play().catch(() => {});

    let onScreen = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) play();
        else video.pause();
      },
      /* A sliver is enough: the sticky stage is on screen for the whole
         section, so this only ever fires at the two ends of it. */
      { threshold: 0 },
    );
    observer.observe(section);

    /* Escalating, because the cheap fix works far more often than the
       expensive one and the expensive one costs the viewer a visible
       hitch: ask it to play, then jog the playhead to make the decoder
       build a fresh frame, then finally start the whole element over. */
    let mark = -1;
    let stuck = 0;
    const watchdog = window.setInterval(() => {
      if (!onScreen || document.hidden) return;

      if (video.paused) {
        play();
        return;
      }

      if (Math.abs(video.currentTime - mark) > 0.02) {
        mark = video.currentTime;
        stuck = 0;
        return;
      }

      stuck += 1;
      if (stuck === 2) {
        play();
      } else if (stuck === 4) {
        video.currentTime = (video.currentTime + 0.06) % (video.duration || 10);
        play();
      } else if (stuck >= 6) {
        video.load();
        play();
        stuck = 0;
      }
    }, 700);

    return () => {
      observer.disconnect();
      window.clearInterval(watchdog);
    };
  }, [wantsVideo]);

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
   * The storyboard, wired to the scroll bar.
   *
   * Built once, and it touches nothing the film owns: the picture runs on
   * its own clock underneath, and this only walks the room forward and
   * hands the copy from one beat to the next. So the video arriving never
   * tears this timeline down and rebuilds it mid-scroll, and the poster
   * alone already carries the dolly, the vignette and every copy beat — the
   * hero is never a dead stretch while the film is still on its way.
   */
  useEffect(() => {
    if (!cinematic) return;

    const ctx = gsap.context(() => {
      const stage = stageRef.current;
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
            {wantsVideo && (
              <video
                ref={videoRef}
                className={`${styles.plate} ${styles.video}`}
                data-ready={filmReady ? "true" : "false"}
                src={assets.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                /* Not `canplaythrough`: the picture is only crossfading up
                   over its own frame zero, so the moment there is a frame to
                   show is the moment to start showing it. */
                onLoadedData={() => setFilmReady(true)}
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
          <span className={styles.cueLabel}>Scroll to explore</span>
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
