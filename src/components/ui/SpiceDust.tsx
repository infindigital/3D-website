"use client";

import { useEffect, useRef } from "react";
import styles from "./SpiceDust.module.css";

/**
 * Warm motes sampled from the food itself: turmeric, chilli oil, dried
 * chilli, steam-lit powder and coriander.
 */
const COLOURS = [
  [255, 196, 84],
  [245, 132, 42],
  [230, 74, 46],
  [255, 236, 196],
  [154, 190, 112],
] as const;

/** Soft blobs are drawn once per colour and then just stamped, which keeps
 *  a field of a hundred motes to a single-digit millisecond frame. */
const SPRITE = 48;

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  /** 0.35 near the back, 1 near the lens: drives size, alpha and drift */
  depth: number;
  sprite: number;
  phase: number;
  sway: number;
}

export interface SpiceDustProps {
  className?: string;
  /** Motes per megapixel of canvas, so a laptop and a 5K display read alike */
  density?: number;
  /** Multiplies mote radius */
  size?: number;
  /** Peak alpha of a single mote */
  alpha?: number;
}

/**
 * A drifting field of spice particles on a canvas, sized to its container.
 *
 * The hero runs two of these: a dense layer behind the type, and a sparse,
 * dimmer one in front of it, so motes pass on both sides of the headline and
 * the words sit inside the scene rather than on top of a picture of it.
 *
 * Scrolling pushes the field. The wheel adds a shove that decays over the
 * next second, so the dust reacts to the reader the way real dust in a beam
 * reacts to someone walking past it.
 *
 * The loop stops whenever the field is off screen or the tab is hidden, and
 * a reader who asks for reduced motion gets one still frame.
 */
export default function SpiceDust({
  className,
  density = 42,
  size = 1,
  alpha = 0.5,
}: SpiceDustProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* One pre-rendered radial blob per colour, stamped with drawImage */
    const sprites = COLOURS.map(([r, g, b]) => {
      const sprite = document.createElement("canvas");
      sprite.width = SPRITE;
      sprite.height = SPRITE;
      const sctx = sprite.getContext("2d");
      if (sctx) {
        const half = SPRITE / 2;
        const grad = sctx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.55)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, SPRITE, SPRITE);
      }
      return sprite;
    });

    const motes: Mote[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let shove = 0;
    let lastScroll = window.scrollY;
    let running = false;
    let visible = false;

    const spawn = (mote: Partial<Mote> = {}): Mote => {
      const depth = 0.35 + Math.random() * 0.65;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: (0.8 + Math.random() * 2.6) * depth * size,
        vx: (Math.random() - 0.5) * 0.16 * depth,
        /* Mostly rising, as warm air over a hot plate would carry it */
        vy: -(0.06 + Math.random() * 0.3) * depth,
        depth,
        sprite: Math.floor(Math.random() * sprites.length),
        phase: Math.random() * Math.PI * 2,
        sway: 0.2 + Math.random() * 0.7,
        ...mote,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const wanted = Math.round(((width * height) / 1_000_000) * density);
      if (motes.length > wanted) motes.length = wanted;
      while (motes.length < wanted) motes.push(spawn());
      if (still) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const mote of motes) {
        const d = mote.r * 6;
        ctx.globalAlpha = alpha * mote.depth;
        ctx.drawImage(sprites[mote.sprite], mote.x - d / 2, mote.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const step = (now: number) => {
      /* Clamped so a backgrounded tab does not teleport the whole field */
      const dt = Math.min(now - last, 48) / 16.67;
      last = now;

      for (const mote of motes) {
        mote.phase += 0.012 * mote.sway * dt;
        mote.x += (mote.vx + Math.sin(mote.phase) * 0.14 * mote.sway) * dt;
        mote.y += (mote.vy + shove * mote.depth) * dt;

        /* Wrap rather than respawn, so the field never thins out */
        if (mote.x < -12) mote.x = width + 12;
        else if (mote.x > width + 12) mote.x = -12;
        if (mote.y < -12) mote.y = height + 12;
        else if (mote.y > height + 12) mote.y = -12;
      }

      shove *= 0.94;
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || still) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      /* Capped so a flick of the wheel nudges the dust instead of firing it */
      shove = Math.max(-2.4, Math.min(2.4, shove + delta * 0.012));
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { rootMargin: "120px" },
    );

    const resizeObserver = new ResizeObserver(resize);

    resize();
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    if (!still) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
    };
  }, [density, size, alpha]);

  return (
    <canvas
      ref={canvasRef}
      className={className ? `${styles.canvas} ${className}` : styles.canvas}
      aria-hidden="true"
    />
  );
}
