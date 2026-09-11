"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { StagePack } from "@/three/world/types";
import { worldState } from "./worldState";
import { LIGHT_KEYS, TALL_FLIGHT, WIDE_FLIGHT, type Flight } from "./flightPath";
import { TALL_SCREENS, WIDE_SCREENS } from "./film";
import FilmDeck, { TALL_GRID, WIDE_GRID } from "./FilmDeck";
import WorldPack, { createPackGeometry } from "./WorldPack";

/**
 * Which of the two worlds this is. `wide` is the corridor a desktop looks
 * across; `tall` is the shaft a phone falls down. Everything that differs
 * between them — the route, where the packs stand, how the film is framed,
 * and how much of the machine any of it is allowed to cost — is chosen
 * here and nowhere else.
 */
export type WorldMode = "wide" | "tall";

const WORLDS: Record<WorldMode, { flight: Flight; screens: typeof WIDE_SCREENS; grid: typeof WIDE_GRID }> = {
  wide: { flight: WIDE_FLIGHT, screens: WIDE_SCREENS, grid: WIDE_GRID },
  tall: { flight: TALL_FLIGHT, screens: TALL_SCREENS, grid: TALL_GRID },
};

/** Fog and clear colour: the page's own cream, so the corridor has no walls */
const CREAM = "#fff8ee";

/**
 * How fast the corridor gives way to cream.
 *
 * Light rather than atmospheric on purpose. Fog is what tells the eye the
 * corridor has depth, but every unit of it is a unit of the film washed out,
 * and the film is the thing worth looking at. Far enough back that a screen
 * still sits behind the one in front of it, and no further.
 *
 * Thinned from 0.026: at that density the cream reached the packs as well as
 * the far wall, and a pack greyed by fog reads as a pack photographed badly.
 * Depth survives the cut — the near screen still separates from the far one.
 */
const FOG_DENSITY = 0.016;

interface WorldCanvasProps {
  packs: StagePack[];
  /** Whether the world is near enough to be worth drawing at all */
  awake: boolean;
  mode: WorldMode;
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
function Rig({ flight }: { flight: Flight }) {
  const { cameraCurve, targetCurve } = flight;
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

/**
 * The shape the shaft is composed for: a phone held upright, which is a
 * frame about half as wide as it is tall.
 */
const PHONE_ASPECT = 0.5;

/**
 * How much longer a lens a wider portrait frame is given, and the ceiling
 * on it.
 *
 * A portrait tablet gets the shaft rather than the corridor, and it should
 * — the six beats work the same way falling down a tall frame whatever is
 * holding it. But fov is vertical, so the same lens in a frame half again
 * as wide puts the same pack in the middle of a field of paper: the pack
 * keeps its share of the height and loses half its share of the width, and
 * the copy panel ends up sitting well below the pack's feet with nothing in
 * between. It reads as a phone's composition stretched, which is what it is.
 *
 * The staging is not what is wrong — a wider frame simply wants a longer
 * lens. The ceiling is what the tightest beat can pay for: on the closing
 * pair the packs stand just above the promise panel, and that clearance is
 * the whole budget. It is set by the smallest tablet rather than the
 * largest, because the panel is sized by its words and not by the screen —
 * on a shorter frame the same paragraph is a bigger share of it, and the
 * feet of the packs run out of floor first there.
 */
const MAX_FRAME_ZOOM = 1.12;
const ZOOM_PER_ASPECT = 0.9;

/**
 * Fits the shaft to the frame that is holding it.
 *
 * `setViewOffset` rather than a smaller fov, because a fov is measured
 * about the point the camera is aimed at and the shaft's pack is not there
 * — it is up in the top half, with its head a few pixels under the
 * navigation bar. Narrowing the lens would grow it about the middle of the
 * screen and push that head straight behind the bar.
 *
 * The offset is a window onto a larger frame, so the anchor is ours to
 * choose: the window is taken from the top edge, which is exactly the edge
 * the composition is already tight against. The pack grows downward, into
 * the empty band above the copy, and stays where it was under the bar.
 * Horizontally the window stays centred, because nothing about the shaft is
 * off to one side.
 *
 * A phone lands on zoom 1 and clears the offset entirely — this is a
 * correction for frames wider than the one the world was drawn for, and a
 * phone is that frame.
 */
function Framing({ mode }: { mode: WorldMode }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useEffect(() => {
    const zoom =
      mode === "tall"
        ? THREE.MathUtils.clamp(
            1 + (width / height - PHONE_ASPECT) * ZOOM_PER_ASPECT,
            1,
            MAX_FRAME_ZOOM,
          )
        : 1;

    if (zoom <= 1.001) {
      camera.clearViewOffset();
    } else {
      camera.setViewOffset(
        width * zoom,
        height * zoom,
        (width * (zoom - 1)) / 2,
        0,
        width,
        height,
      );
    }
    camera.updateProjectionMatrix();

    return () => {
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
  }, [camera, mode, width, height]);

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

function Scene({ packs, awake, mode, onSelect }: WorldCanvasProps) {
  const { flight, screens, grid } = WORLDS[mode];
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

      <Rig flight={flight} />
      <Framing mode={mode} />
      <FilmDeck awake={awake} screens={screens} grid={grid} />

      {flight.slots.map((slot) => {
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
export default function WorldCanvas({ packs, awake, mode, onSelect }: WorldCanvasProps) {
  const { flight } = WORLDS[mode];
  const tall = mode === "tall";
  /* Where the flight starts, so the very first frame is already in frame
     rather than a jump from a hard-coded seat to the real one */
  const start = flight.cameraCurve.getPoint(0);

  return (
    <Canvas
      /* Nothing is drawn behind the hero. The scene is still here, and the
         first frame after waking is a frame of the same continuous flight —
         the camera is a pure function of scroll, so it has not drifted. */
      frameloop={awake ? "always" : "never"}
      /*
       * Capped, but at the screen rather than under it.
       *
       * 1.75 was chosen on the grounds that the gap to 2x is invisible on a
       * wall of video. That holds for the video and not for the packs: a
       * retina laptop is 2 device pixels to the CSS pixel, so a buffer at
       * 1.75 is upscaled by the browser on its way to the glass, and the
       * resample lands on the printed artwork — the small type across the
       * front of a pack is exactly the high-frequency detail a non-integer
       * upscale smears. The packs are the product, so the cap is now the
       * screen's own ratio and the common case resolves 1:1.
       *
       * A phone is still capped below its screen. Three device pixels to
       * the CSS pixel against a fraction of a laptop's fill rate is a bill
       * a shaft of transparent tiles cannot pay, so it takes the sharpening
       * it can afford rather than all of it.
       */
      dpr={tall ? [1, 1.75] : [1, 2]}
      camera={{
        position: [start.x, start.y, start.z],
        fov: flight.fov,
        near: 0.1,
        far: 120,
      }}
      gl={{
        alpha: true,
        antialias: true,
        /* Asking a phone for the high-performance adapter is asking for the
           battery, and there is only ever one GPU there to give. */
        powerPreference: tall ? "default" : "high-performance",
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
        <Scene packs={packs} awake={awake} mode={mode} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
