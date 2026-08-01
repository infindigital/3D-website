"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import SpiceField from "./SpiceField";
import { supportsWebGL } from "@/utils/webgl";

/**
 * The hero's ambient 3D layer: a transparent R3F canvas carrying the spice
 * particle field. Mounts only with WebGL and full motion allowed, drops the
 * particle count on small screens and stops rendering frames entirely once
 * the hero scrolls out of view.
 */
export default function HeroCanvas({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(380);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setReady(supportsWebGL() && !reduced.matches);
      setCount(small.matches ? 220 : 380);
    };
    update();
    reduced.addEventListener("change", update);
    small.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      small.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  if (!ready) return null;

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <SpiceField count={count} />
      </Canvas>
    </div>
  );
}
