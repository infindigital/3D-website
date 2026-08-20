"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks the pointer over the attached element and exposes a smoothed
 * position as CSS variables --parallax-x and --parallax-y (range -1 to 1).
 * Child layers multiply those by their own depth for a 3D parallax.
 * Disabled on touch-only devices and for reduced motion preferences.
 *
 * The easing is time-based rather than per-frame, so the glide takes the
 * same fifth of a second whether the display runs at 60Hz or 144Hz, and the
 * loop parks itself once the position has settled instead of burning a frame
 * callback for the whole time the page is open.
 */
const TAU = 0.19; /* seconds to close ~63% of the remaining distance */
const SETTLED = 0.0004;

export function usePointerParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let last = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;

      const k = 1 - Math.exp(-dt / TAU);
      x += (targetX - x) * k;
      y += (targetY - y) * k;
      el.style.setProperty("--parallax-x", x.toFixed(4));
      el.style.setProperty("--parallax-y", y.toFixed(4));

      if (
        Math.abs(targetX - x) < SETTLED &&
        Math.abs(targetY - y) < SETTLED
      ) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
      );
      targetY = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
      wake();
    };

    /* Leaving the window entirely fires no pointerleave, so recentre on
       blur too rather than leaving the scene frozen off to one side. */
    const recentre = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", recentre);
    window.addEventListener("blur", recentre);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", recentre);
      window.removeEventListener("blur", recentre);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
