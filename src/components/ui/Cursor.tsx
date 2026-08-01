"use client";

import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

/**
 * A soft ring that trails the pointer through the world and swells over
 * anything you can act on. The system cursor stays exactly where it is —
 * this rides alongside it rather than replacing it, so nobody loses the
 * thing they aim with, and everything still works if this never draws.
 *
 * Two elements, not one: the dot tracks the pointer with no lag at all so
 * aiming stays honest, and the ring lags behind it, which is what reads as
 * weight. Pointer devices only, and never under reduced motion.
 */
const RING_TAU = 0.055; /* seconds to close ~63% of the gap to the pointer */

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let raf = 0;
    let last = 0;
    let awake = false;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const k = 1 - Math.exp(-dt / RING_TAU);
      x += (targetX - x) * k;
      y += (targetY - y) * k;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;

      if (!awake) {
        awake = true;
        x = targetX;
        y = targetY;
        document.body.dataset.cursorReady = "true";
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }

      /* Anything interactive under the pointer swells the ring. The 3D
         packs cannot be hit-tested from here, so they set the same flag
         themselves from inside the canvas. */
      const el = event.target as Element | null;
      const over = el?.closest?.("a, button, [data-cursor-target]");
      if (over && document.body.dataset.cursor !== "pack") {
        document.body.dataset.cursor = "link";
      } else if (!over && document.body.dataset.cursor === "link") {
        document.body.dataset.cursor = "";
      }
    };

    const onLeave = () => {
      document.body.dataset.cursorReady = "false";
    };
    const onEnter = () => {
      if (awake) document.body.dataset.cursorReady = "true";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      if (raf) cancelAnimationFrame(raf);
      delete document.body.dataset.cursorReady;
      delete document.body.dataset.cursor;
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
