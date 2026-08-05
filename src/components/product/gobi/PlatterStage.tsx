"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gobiServings } from "@/config/gobi";
import type { Product } from "@/config/products";
import styles from "./PlatterStage.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Degrees between neighbouring platters on the turntable. */
const STEP = 360 / gobiServings.length;
/** Idle drift, degrees a second. Slow enough to read, fast enough to notice. */
const IDLE = 7;
/** How far the scroll through the section turns the table. */
const SCROLL_SPAN = 200;
/** Seconds for a flick to lose most of its speed, and for a pick to land. */
const SPIN_DECAY = 0.65;
const PICK_TAU = 0.28;
/** Degrees of turn per pixel dragged. */
const DRAG_GAIN = 0.42;

/** The smallest turn from `from` to `to`, so a pick never takes the long way. */
function shortestTurn(from: number, to: number): number {
  return from + (((to - from) % 360) + 540) % 360 - 180;
}

/**
 * The three ways to plate it, on a turntable.
 *
 * The platters orbit rather than tumble: each one counter-rotates by exactly
 * what the table turns, so a dish photographed from above still reads from
 * above at every angle, and the only thing perspective changes is how near it
 * is. That is the difference between a carousel of plates and a carousel of
 * ovals.
 *
 * It answers to three things at once — its own idle drift, the scroll through
 * the section, and a finger dragged across it — because a showcase that only
 * moves when you touch it looks broken until you touch it, and one that only
 * drifts cannot be steered.
 */
export default function PlatterStage({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* All of the turntable's state lives in one object so the frame loop can
     read and write it without re-rendering anything but the copy panel. */
  const spin = useRef({
    angle: 0,
    velocity: 0,
    /** Set by a pick; the loop eases to it and then clears it. */
    target: null as number | null,
    dragging: false,
    lastX: 0,
    /** Idle drift and scroll turn are both off under reduced motion. */
    free: true,
    /** Which platter the copy panel is currently showing. */
    shown: 0,
  });

  const pick = useCallback((index: number) => {
    const s = spin.current;
    const wanted = -index * STEP;
    s.target = shortestTurn(s.angle, wanted);
    s.velocity = 0;
    /* The panel goes straight to the picked dish rather than flicking
       through whatever the table passes on the way there. */
    s.shown = index;
    setActive(index);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section) return;

    const s = spin.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.free = !reduced.matches;
    const onReduced = () => {
      s.free = !reduced.matches;
    };
    reduced.addEventListener("change", onReduced);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;

      if (!s.dragging) {
        if (s.target !== null) {
          const k = 1 - Math.exp(-dt / PICK_TAU);
          s.angle += (s.target - s.angle) * k;
          if (Math.abs(s.target - s.angle) < 0.05) {
            s.angle = s.target;
            s.target = null;
          }
        } else {
          s.angle += (s.velocity + (s.free ? IDLE : 0)) * dt;
          s.velocity *= Math.exp(-dt / SPIN_DECAY);
        }
      }

      stage.style.setProperty("--spin", `${s.angle.toFixed(2)}deg`);

      /* Whichever platter is nearest the front owns the copy panel. */
      const facing =
        ((Math.round(-s.angle / STEP) % gobiServings.length) +
          gobiServings.length) %
        gobiServings.length;
      if (facing !== s.shown) {
        s.shown = facing;
        setActive(facing);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    /* --- dragging ---------------------------------------------------- */

    const onDown = (event: PointerEvent) => {
      s.dragging = true;
      s.target = null;
      s.velocity = 0;
      s.lastX = event.clientX;
      stage.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!s.dragging) return;
      const dx = event.clientX - s.lastX;
      s.lastX = event.clientX;
      s.angle += dx * DRAG_GAIN;
      /* Carry the last movement out of the drag as a flick. */
      s.velocity = dx * DRAG_GAIN * 22;
    };

    const onUp = (event: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    /* --- the scroll through the section turns it too ------------------ */

    let lastProgress: number | null = null;
    const scroller = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (!s.free) return;
        if (lastProgress !== null && !s.dragging && s.target === null) {
          s.angle += (self.progress - lastProgress) * SCROLL_SPAN;
        }
        lastProgress = self.progress;
      },
    });

    return () => {
      cancelAnimationFrame(raf);
      reduced.removeEventListener("change", onReduced);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      scroller.kill();
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
        `.${styles.stage}`,
        { y: 60, opacity: 0.001, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.2,
      );
      enter.fromTo(
        [`.${styles.detail}`, `.${styles.picker}`],
        { y: 30, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
        0.5,
      );
    });

    return () => mm.revert();
  }, []);

  const serving = gobiServings[active];

  return (
    <section
      ref={sectionRef}
      className={styles.serving}
      style={{ "--accent": product.accentColor } as React.CSSProperties}
      aria-label="Serving and plating ideas"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Serve it</p>
          <h2 className={styles.heading}>Three ways to send it out.</h2>
        </header>

        <div
          className={styles.stage}
          ref={stageRef}
          role="group"
          aria-label="Turntable of serving ideas — drag to spin"
        >
          <div className={styles.ring}>
            {gobiServings.map((idea, index) => (
              <div
                className={styles.platter}
                key={idea.id}
                style={{ "--a": `${index * STEP}deg` } as React.CSSProperties}
              >
                <Image
                  className={styles.platterImg}
                  src={idea.image}
                  alt={`${idea.name}, plated`}
                  width={1100}
                  height={1100}
                  sizes="(max-width: 640px) 62vw, (max-width: 1100px) 40vw, 420px"
                  draggable={false}
                />
              </div>
            ))}
          </div>
          <span className={styles.hint} aria-hidden="true">
            Drag to spin
          </span>
        </div>

        <div className={styles.foot}>
          {/* Keyed so the panel re-enters when the turntable lands elsewhere */}
          <article className={styles.detail} key={serving.id} aria-live="polite">
            <p className={styles.detailStyle}>
              <span className={styles.detailIndex}>{serving.index}</span>
              {serving.style}
            </p>
            <h3 className={styles.detailName}>{serving.name}</h3>
            <p className={styles.detailBody}>{serving.presentation}</p>
            <dl className={styles.detailPairs}>
              <div>
                <dt>Garnish</dt>
                <dd>{serving.garnish}</dd>
              </div>
              <div>
                <dt>Dip</dt>
                <dd>{serving.dip}</dd>
              </div>
            </dl>
          </article>

          {/* The turntable answers to a pointer; these are how it answers to
              a keyboard, and how anyone can jump straight to a dish. */}
          <div className={styles.picker} aria-label="Serving ideas">
            {gobiServings.map((idea, index) => (
              <button
                type="button"
                key={idea.id}
                className={styles.pickerItem}
                aria-current={index === active}
                onClick={() => pick(index)}
              >
                <span className={styles.pickerIndex}>{idea.index}</span>
                <span className={styles.pickerName}>{idea.name}</span>
                <span className={styles.pickerStyle}>{idea.style}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
