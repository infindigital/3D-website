"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "@/hooks/useInView";
import PackModel from "./PackModel";

interface PackFlipCanvasProps {
  /** Owner-supplied artwork URLs under public/assets/products */
  front: string;
  back?: string;
  /** Product accent used for the rim light behind the pack */
  accent: string;
  /** 0 shows the front, 1 the back. Written by the hero's pinned trigger */
  progress: { current: number };
}

/** Turns the pack over as the hero's pinned scroll progresses */
function FlipRig({
  progress,
  children,
}: {
  progress: { current: number };
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, p * Math.PI, 0.14);
    // A slight lean and lift at the halfway point sells the turn
    const arc = Math.sin(p * Math.PI);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, arc * -0.07, 0.14);
    g.position.y = THREE.MathUtils.lerp(g.position.y, arc * 0.14, 0.14);
  });

  return <group ref={group}>{children}</group>;
}

/**
 * The product page's single-pack studio. Same sachet model as the home
 * stage, but here the scroll owns the rotation: the pinned hero turns the
 * pack from its front artwork to the recipe on the back.
 */
export default function PackFlipCanvas({
  front,
  back,
  accent,
  progress,
}: PackFlipCanvasProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
    <Canvas
      dpr={[1, 2]}
      frameloop={inView ? "always" : "never"}
      camera={{ position: [0, 0.1, 5], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} />
      <directionalLight position={[-5, 3, 4]} intensity={0.5} color="#ffe3b8" />
      <pointLight
        position={[0, 1.8, -2]}
        intensity={6}
        distance={8}
        color={accent}
      />
      <Suspense fallback={null}>
        <FlipRig progress={progress}>
          <Float speed={1.3} rotationIntensity={0.18} floatIntensity={0.45}>
            <group scale={2.05}>
              <PackModel front={front} back={back} />
            </group>
          </Float>
        </FlipRig>
        <ContactShadows
          position={[0, -1.75, 0]}
          opacity={0.3}
          scale={8}
          blur={2.6}
          far={3.4}
          color="#7a3c10"
        />
      </Suspense>
    </Canvas>
    </div>
  );
}
