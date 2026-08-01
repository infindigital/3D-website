"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pulls whatever it wraps a little way toward the pointer while the pointer
 * is near it, then lets it drift back. It is the smallest possible amount
 * of physics and it is what makes a button feel like an object rather than
 * a rectangle that changes colour.
 *
 * The pull is written to this wrapper rather than to the child, so the
 * child keeps its own element, classes and any transform of its own. Off
 * for touch and for reduced motion, where there is no hover to answer.
 */
const RADIUS = 90; /* px beyond the element's own box where the pull begins */
const PULL = 0.3; /* fraction of the offset the element actually travels */
const TAU = 0.09; /* seconds to close ~63% of the remaining distance */

export default function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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

      if (Math.abs(targetX - x) < 0.05 && Math.abs(targetY - y) < 0.05) {
        /* Settled. Park the loop rather than burning a frame callback for
           as long as the page is open. */
        x = targetX;
        y = targetY;
        raf = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }

      el.style.transform =
        x === 0 && y === 0
          ? ""
          : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const reach = Math.max(rect.width, rect.height) / 2 + RADIUS;

      if (Math.hypot(dx, dy) > reach) {
        if (targetX === 0 && targetY === 0) return;
        targetX = 0;
        targetY = 0;
      } else {
        targetX = dx * PULL;
        targetY = dy * PULL;
      }
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, []);

  return (
    <span ref={ref} style={{ display: "inline-flex", willChange: "transform" }}>
      {children}
    </span>
  );
}
