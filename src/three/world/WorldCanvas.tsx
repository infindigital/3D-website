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
import WorldPack, { createPackGeometry } from "./WorldPack";

/** Fog and clear colour: the page's own cream, so the corridor has no walls */
const CREAM = "#fff8ee";

/**
 * How fast the corridor gives way to cream.
 *
 * Light rather than atmospheric on purpose. Fog is what tells the eye the
 * corridor has depth, but every unit of it is a unit of the film washed out,
 * and the film is the thing worth looking at. Far enough back that a screen
 * still sits behind the one in front of it, and no further.
 */
const FOG_DENSITY = 0.026;

interface WorldCanvasProps {
  packs: StagePack[];
  /** Whether the world is near enough to be worth drawing at all */
  awake: boolean;
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
function Rig() {
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

  /* Reach rather than punch: it has to wash a whole pack in its beat's
     colour without burning a hot spot into the middle of the artwork, now
     that nothing tone-maps the highlights back down. */
  return <pointLight ref={light} intensity={6} distance={16} decay={1.4} />;
}

function Scene({ packs, awake, onSelect }: WorldCanvasProps) {
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
      {/* A bright, evenly lit room. The packs are printed artwork: the job
          of the light here is to show the print, not to model a mood on top
          of it, so the ambient carries most of it and the directionals only
          give the pillowed film something to catch. */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 6]} intensity={1.05} />
      <directionalLight position={[-5, 3, 4]} intensity={0.5} color="#fff0d8" />
      <TravellingLight />

      <Rig />
      <FilmDeck awake={awake} />

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
 *
 * Mounted is not the same as drawing, though. Until the world is nearly on
 * screen the loop does not run at all — the context, the geometry and the
 * textures are all built and standing by, and not one frame is rendered.
 * Everything above this canvas gets the whole machine to itself.
 */
export default function WorldCanvas({ packs, awake, onSelect }: WorldCanvasProps) {
  return (
    <Canvas
      /* Nothing is drawn behind the hero. The scene is still here, and the
         first frame after waking is a frame of the same continuous flight —
         the camera is a pure function of scroll, so it has not drifted. */
      frameloop={awake ? "always" : "never"}
      /* Capped rather than uncapped: the difference between 2x and 1.75x on
         a wall of video is invisible and the fill cost is not. */
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 6.6], fov: 38, near: 0.1, far: 120 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        /*
         * No filmic curve over this world.
         *
         * A tone map exists to fit a high dynamic range into a screen, and
         * it pays for that by rolling off the highlights and pulling the
         * saturation out of everything. Nothing here has that range to fit:
         * the film is already graded, the packs are printed artwork, and
         * the room is cream. Left on, ACES quietly greys the packs down and
         * puts them at odds with the untone-mapped film standing behind
         * them; off, both are exactly the colours the files hold.
         */
        toneMapping: THREE.NoToneMapping,
      }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2(CREAM, FOG_DENSITY);
      }}
    >
      <Suspense fallback={null}>
        <Scene packs={packs} awake={awake} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
