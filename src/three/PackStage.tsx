"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "@/hooks/useInView";
import PackModel from "./PackModel";

export interface StagePack {
  slug: string;
  name: string;
  /** Owner-supplied artwork URLs under public/assets/products */
  front: string;
  back?: string;
  /** Product accent used for the rim light behind its pack */
  accent: string;
}

interface PackStageProps {
  packs: StagePack[];
  /** Scroll progress of the section (0 to 1), written by a ScrollTrigger */
  progress: { current: number };
  onSelect: (slug: string) => void;
}

/** Eases the whole stage against the section's scroll progress */
function Rig({
  progress,
  children,
}: {
  progress: { current: number };
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, (p - 0.5) * 0.5, 0.08);
    g.position.y = THREE.MathUtils.lerp(g.position.y, (0.5 - p) * 0.4, 0.08);
  });

  return <group ref={group}>{children}</group>;
}

/**
 * Studio scene for the real product packs: each sachet floats gently, can be
 * grabbed and turned to see the back of the pack, and a soft contact shadow
 * grounds it. A click that is not a drag opens the product page.
 */
export default function PackStage({ packs, progress, onSelect }: PackStageProps) {
  const spread = packs.length > 1 ? 1.35 : 0;
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
    <Canvas
      dpr={[1, 2]}
      frameloop={inView ? "always" : "never"}
      camera={{ position: [0, 0.15, 5.4], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} />
      <directionalLight position={[-5, 3, 4]} intensity={0.5} color="#ffe3b8" />
      <Suspense fallback={null}>
        <Rig progress={progress}>
          {packs.map((pack, index) => {
            const x = index === 0 ? -spread : spread;
            const lean = index === 0 ? 1 : -1;
            return (
              <group key={pack.slug} position={[x, 0.05, 0]}>
                <pointLight
                  position={[0, 1.6, -1.8]}
                  intensity={5}
                  distance={7}
                  color={pack.accent}
                />
                <PresentationControls
                  snap
                  cursor
                  speed={1.4}
                  polar={[-0.2, 0.25]}
                  azimuth={[-0.8, 0.8]}
                >
                  <Float
                    speed={1.4 - index * 0.3}
                    rotationIntensity={0.25}
                    floatIntensity={0.5}
                  >
                    <group scale={1.7} rotation={[0, lean * 0.16, lean * 0.03]}>
                      <PackModel
                        front={pack.front}
                        back={pack.back}
                        onSelect={() => onSelect(pack.slug)}
                      />
                    </group>
                  </Float>
                </PresentationControls>
              </group>
            );
          })}
        </Rig>
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.3}
          scale={9}
          blur={2.6}
          far={3.2}
          color="#7a3c10"
        />
      </Suspense>
    </Canvas>
    </div>
  );
}
