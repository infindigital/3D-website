"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { StagePack } from "@/three/PackStage";
import { supportsWebGL } from "@/utils/webgl";
import styles from "./ProductStage.module.css";

gsap.registerPlugin(ScrollTrigger);

const PackStage = dynamic(() => import("@/three/PackStage"), { ssr: false });

/**
 * The 3D product showcase. Renders only when the owner-supplied package
 * artwork exists (gated in page.tsx), shows the sachets as interactive 3D
 * objects you can grab and turn, and falls back to flat artwork for reduced
 * motion or missing WebGL. Clicking a pack, or the links beneath it, opens
 * the product page.
 */
export default function ProductStage({ packs }: { packs: StagePack[] }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShow3D(supportsWebGL() && !reduced.matches);
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  // The texture loader fetches the raw artwork files, so warm them up as
  // soon as we know the 3D stage will mount instead of waiting for three.js
  if (show3D) {
    for (const pack of packs) {
      preload(pack.front, { as: "image" });
      if (pack.back) preload(pack.back, { as: "image" });
    }
  }

  useEffect(() => {
    if (!show3D || !sectionRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => trigger.kill();
  }, [show3D]);

  return (
    <section
      ref={sectionRef}
      className={styles.stage}
      aria-label="The RS Chef'z lineup"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>The Lineup</p>
        <h2 className={styles.title}>Two packs. Every favourite.</h2>
        <p className={styles.sub}>
          {show3D
            ? "Grab a pack and turn it around. The recipes live on the back."
            : "Every recipe on the back, every promise on the front."}
        </p>

        {show3D ? (
          <div className={styles.canvasWrap}>
            <PackStage
              packs={packs}
              progress={progressRef}
              onSelect={(slug) => router.push(`/products/${slug}`)}
            />
          </div>
        ) : (
          <div className={styles.fallbackRow}>
            {packs.map((pack) => (
              <Link
                key={pack.slug}
                href={`/products/${pack.slug}`}
                className={styles.fallbackItem}
                aria-label={`Explore ${pack.name}`}
              >
                <Image
                  className={styles.fallbackImg}
                  src={pack.front}
                  alt={`${pack.name} pack`}
                  width={400}
                  height={560}
                  sizes="(max-width: 560px) 44vw, 240px"
                />
              </Link>
            ))}
          </div>
        )}

        <div className={styles.links}>
          {packs.map((pack) => (
            <Link
              key={pack.slug}
              href={`/products/${pack.slug}`}
              className={styles.linkCard}
              style={{ "--accent": pack.accent } as React.CSSProperties}
            >
              Explore {pack.name}
              <span aria-hidden="true"> {"→"}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
