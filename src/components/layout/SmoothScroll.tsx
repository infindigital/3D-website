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

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
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
