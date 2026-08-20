"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is on screen. The 3D canvases use this to stop
 * rendering frames entirely once their section scrolls away, so a page with
 * several scenes only ever pays for the one in front of the visitor.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
