"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps the app with Lenis smooth scrolling.
 * ScrollTrigger updates from this same Lenis instance, so there is exactly
 * one scroll source of truth. Under reduced motion Lenis is skipped and
 * ScrollTrigger falls back to native scroll.
 */
/** The live instance, so in-page jumps go through Lenis instead of fighting it */
let activeLenis: Lenis | null = null;

/**
 * Scrolls to an element. Lenis owns the scroll position while it is running,
 * so a native scrollIntoView would tear; this hands the move to Lenis and
 * only falls back to the browser when Lenis is off (reduced motion).
 */
export function scrollToElement(target: Element | null) {
  if (!target) return;
  if (activeLenis) {
    activeLenis.scrollTo(target as HTMLElement, { duration: 1.4 });
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Holds the page still, and lets it go again.
 *
 * Lenis owns the wheel and the touch drag while it is running, so stopping
 * it is enough to hold the page — no overflow hidden, and therefore no
 * scrollbar disappearing out from under the layout. Under reduced motion
 * Lenis is off, and so is everything that would want the page held.
 */
export function setScrollLocked(locked: boolean) {
  if (!activeLenis) return;
  if (locked) activeLenis.stop();
  else activeLenis.start();
}

/**
 * Scrolls to an absolute document offset. The 3D world's rail needs to land
 * partway through a section rather than at an element, which scrollTo on an
 * element cannot express.
 */
export function scrollToOffset(y: number) {
  if (activeLenis) {
    activeLenis.scrollTo(y, { duration: 1.6 });
    return;
  }
  window.scrollTo({ top: y, behavior: "smooth" });
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    /*
     * How the page answers the wheel.
     *
     * `duration` is how long the page is still moving after the wheel has
     * stopped, and it is the whole of how smooth scrolling feels. Too short
     * and it is native scroll with extra steps; too long and every flick
     * carries on gliding after the reader has arrived, then has to be
     * caught and turned round — which reads as the page dragging rather
     * than as smoothness. Just under a second is short enough that the page
     * stops roughly where it is pushed, and long enough to lose the steps
     * a mouse wheel actually sends.
     *
     * Touch is deliberately left alone. Lenis only takes the wheel here;
     * a finger drag stays on the browser's own scroller, which runs off the
     * main thread and cannot be made to stutter by anything drawing on it.
     */
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    activeLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      activeLenis = null;
    };
  }, []);

  return <>{children}</>;
}
