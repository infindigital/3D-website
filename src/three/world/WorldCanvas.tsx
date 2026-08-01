"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { StagePack } from "@/three/world/types";
import { worldState } from "./worldState";
import {
  LIGHT_KEYS,
  PACK_SLOTS,
  cameraCurve,
  targetCurve,
} from "./flightPath";
import FilmDeck from "./FilmDeck";
import SpiceField from "./SpiceField";
import WorldPack, { createPackGeometry } from "./WorldPack";

/** Fog and clear colour: the page's own cream, so the corridor has no walls */
const CREAM = "#fff8ee";

interface WorldCanvasProps {
  packs: StagePack[];
  onSelect: (slug: string) => void;
}

/**
 * Flies the camera along the world's path against scroll progress.
 *
 * The path is sampled rather than animated, so the camera is a pure
 * function of where the page is: stop scrolling and it stops, scroll back
 * and it retraces exactly. The damping on top of that is what makes it a
 * camera rather than a cursor, and it is time-based so the weight of the
 * move is the same on every display.
 */
function Rig({ streakRef }: { streakRef: { current: number } }) {
  const camera = useThree((state) => state.camera);
  const position = useRef(new THREE.Vector3().copy(cameraCurve.getPoint(0)));
  const target = useRef(new THREE.Vector3().copy(targetCurve.getPoint(0)));
  const sampled = useRef(new THREE.Vector3());
  const shown = useRef(0);

  useFrame((_, delta) => {
    const p = THREE.MathUtils.clamp(worldState.progress, 0, 1);
    shown.current = THREE.MathUtils.damp(shown.current, p, 4.5, delta);

    cameraCurve.getPoint(shown.current, sampled.current);
    position.current.copy(sampled.current);

    /* The pointer moves the camera itself rather than the world, so the
       parallax between the near dust and the far packs is real projection
       and not a layer sliding over another layer. */
    position.current.x += worldState.pointerX * 0.34;
    position.current.y += -worldState.pointerY * 0.2;
    camera.position.copy(position.current);

    targetCurve.getPoint(shown.current, sampled.current);
    target.current.lerp(sampled.current, 1 - Math.exp(-6 * delta));
    camera.lookAt(target.current);

    /* Speed is measured off the eased camera, not the raw scroll, so the
       streak matches what is actually happening on screen. */
    const speed = Math.abs(p - shown.current);
    streakRef.current = THREE.MathUtils.damp(
      streakRef.current,
      THREE.MathUtils.clamp(speed * 26, 0, 1),
      6,
      delta,
    );
  });

  return null;
}

/** The one moving light, carrying each beat's colour down the corridor */
function TravellingLight() {
  const light = useRef<THREE.PointLight>(null);
  const camera = useThree((state) => state.camera);

  /* Parsed once. Building a Color from a hex string inside useFrame would
     allocate sixty objects a second for no reason. */
  const stops = useMemo(
    () => LIGHT_KEYS.map((key) => ({ at: key.at, color: new THREE.Color(key.color) })),
    [],
  );
  const colour = useMemo(() => stops[0].color.clone(), [stops]);
  const next = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const l = light.current;
    if (!l) return;
    const p = THREE.MathUtils.clamp(worldState.progress, 0, 1);

    let lower = stops[0];
    let upper = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i += 1) {
      if (p >= stops[i].at && p <= stops[i + 1].at) {
        lower = stops[i];
        upper = stops[i + 1];
        break;
      }
    }
    const span = upper.at - lower.at || 1;
    next.copy(lower.color).lerp(upper.color, (p - lower.at) / span);
    colour.lerp(next, 1 - Math.exp(-3 * delta));
    l.color.copy(colour);

    /* It travels with the camera, a little above and behind the lens */
    l.position.set(camera.position.x, camera.position.y + 1.6, camera.position.z + 1.2);
  });

  return <pointLight ref={light} intensity={9} distance={12} decay={1.6} />;
}

function Scene({ packs, onSelect }: WorldCanvasProps) {
  const streakRef = useRef(0);
  const geometry = useMemo(() => createPackGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  /* Every pack in the world shares two textures, loaded once. Slots that
     point at an artwork the owner has not supplied are skipped. */
  const urls = useMemo(
    () => packs.flatMap((pack) => [pack.front, pack.back ?? pack.front]),
    [packs],
  );
  const textures = useTexture(urls, (loaded) => {
    for (const texture of Array.isArray(loaded) ? loaded : [loaded]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 6]} intensity={1.2} />
      <directionalLight position={[-5, 3, 4]} intensity={0.45} color="#ffe3b8" />
      <TravellingLight />

      <Rig streakRef={streakRef} />
      <FilmDeck />
      <SpiceField streakRef={streakRef} />

      {PACK_SLOTS.map((slot) => {
        const pack = packs[slot.product];
        if (!pack) return null;
        return (
          <WorldPack
            key={slot.id}
            slot={slot}
            geometry={geometry}
            front={textures[slot.product * 2]}
            back={textures[slot.product * 2 + 1]}
            accent={pack.accent}
            label={pack.name}
            onSelect={() => onSelect(pack.slug)}
          />
        );
      })}
    </>
  );
}

/**
 * The one canvas behind the whole home page below the hero. It is mounted
 * once and never unmounted while the world is on screen, which is the point:
 * the sections do not each own a scene, they are captions over a single
 * continuous flight.
 */
export default function WorldCanvas({ packs, onSelect }: WorldCanvasProps) {
  return (
    <Canvas
      /* Capped rather than uncapped: at this particle count the difference
         between 2x and 1.75x is invisible and the fill cost is not. */
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 6.6], fov: 38, near: 0.1, far: 120 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2(CREAM, 0.05);
      }}
    >
      <Suspense fallback={null}>
        <Scene packs={packs} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
