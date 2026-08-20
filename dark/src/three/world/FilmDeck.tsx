"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "./worldState";
import { bandOpacity } from "./bands";
import {
  FILM_ASPECT,
  FILM_SRC,
  segmentRate,
  type FilmScreen,
} from "./film";

/**
 * The film, standing in the world.
 *
 * Each screen is a wall of tiles rather than a rectangle of video. The
 * tiles come in from the surrounding dust as their beat arrives, lock into
 * a gently bowed surface, and push toward the lens by however bright the
 * film is at that tile — so the plate of florets has relief and the dark
 * pan falls away behind it. Leaving the beat lets them go again.
 *
 * That is what makes it part of the room rather than a backdrop: the packs
 * stand in front of it, the camera passes it at an angle, and the fog of
 * the corridor reaches it.
 */

/**
 * How finely a screen is broken up.
 *
 * The wide world draws six of these across a desktop GPU. A phone draws the
 * same six through a fraction of the fill rate, and every tile is a
 * transparent quad that overruns its neighbour — so the grid there is
 * roughly a third of the tiles for the same wall. It is not a downgrade
 * anyone can see: the tiles on a portrait screen are already smaller in
 * absolute terms, because the wall itself is.
 */
export type TileGrid = readonly [cols: number, rows: number];

export const WIDE_GRID: TileGrid = [30, 17];
export const TALL_GRID: TileGrid = [18, 10];

/** How far the brightest part of a shot stands out from the darkest.
 *  Kept small on purpose: relief is what stops the wall reading as a
 *  sticker, but past a point the tiles pull apart and it reads as a
 *  broken mosaic instead of a film. */
const DEPTH = 0.2;

/** The page's ground, mixed in with distance so a far screen sits back.
    It has to match the scene fog in WorldCanvas or the tiles fade toward
    one shade while the room fades toward another. */
const GROUND = new THREE.Color("#161110");

/**
 * The grade.
 *
 * The film is a bright, evenly lit kitchen already, so what it wants is
 * depth, not exposure: lifting it further only turns the plates and the
 * ceiling — most of the frame — to milk. Contrast and saturation instead,
 * both gentle, both around the middle so nothing at either end clips.
 */
const CONTRAST = 1.08;
const SATURATION = 1.18;

/**
 * How far each tile spills over its own cell.
 *
 * Tiles do not all sit at the same depth — that is the whole point of the
 * relief — and two quads at different depths seen through a perspective
 * lens project to different sizes, so cells that abut exactly in the plane
 * pull apart on screen and show the page as a bright grid of seams. The
 * worst of it is out at the sides, where the bow is steepest and a column
 * of tiles leans hardest away from its neighbour.
 *
 * The uv spills with the quad, so both tiles draw the same picture in the
 * band they share — but drawing it twice through a transparent material is
 * how the gap turns into a bright grid instead of a dark one. The fragment
 * shader carries a matching weight that hands the band from one tile to the
 * next, so the pair composites to exactly what one tile alone would.
 *
 * That is why this is generous rather than measured: once the handover is
 * exact, spilling further costs a little fill and nothing else, so it is
 * set past the worst corner of the worst screen instead of against it.
 */
const OVERLAP = 1.3;

/** A fixed sequence, so the tiles scatter the same way on every load */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createTileGeometry([COLS, ROWS]: TileGrid): THREE.InstancedBufferGeometry {
  const TILES = COLS * ROWS;
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setIndex(base.index);
  geo.setAttribute("position", base.attributes.position);
  geo.setAttribute("uv", base.attributes.uv);
  geo.instanceCount = TILES;

  const tile = new Float32Array(TILES * 2);
  const scatter = new Float32Array(TILES * 3);
  const delay = new Float32Array(TILES);
  const random = makeRandom(70414);

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const i = row * COLS + col;
      tile[i * 2] = col;
      tile[i * 2 + 1] = row;

      /* Loose tiles drift mostly sideways and toward the lens, so the wall
         gathers out of the room rather than rising off a floor */
      scatter[i * 3] = (random() * 2 - 1) * 2.6;
      scatter[i * 3 + 1] = (random() * 2 - 1) * 1.7;
      scatter[i * 3 + 2] = random() * 2.4 - 0.4;

      /* Staggered so the wall knits together instead of snapping shut */
      delay[i] = random();
    }
  }

  const instanced = (data: Float32Array, size: number) =>
    new THREE.InstancedBufferAttribute(data, size);

  geo.setAttribute("aTile", instanced(tile, 2));
  geo.setAttribute("aScatter", instanced(scatter, 3));
  geo.setAttribute("aDelay", instanced(delay, 1));

  /* The base plane is one unit wide, so the wall would cull itself out of
     view the moment the tiles spread past it. */
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 14);

  return geo;
}

function createScreenMaterial(
  texture: THREE.Texture,
  size: THREE.Vector2,
  opacity: number,
  [COLS, ROWS]: TileGrid,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    /* Asked for by name rather than left to the default: reading the film
       in the vertex shader needs textureLod, which only exists once the
       shader is compiled as GLSL ES 3.00. three's own prefix still maps
       attribute, varying and gl_FragColor, so the rest reads the same. */
    glslVersion: THREE.GLSL3,
    uniforms: {
      uMap: { value: texture },
      uGrid: { value: new THREE.Vector2(COLS, ROWS) },
      uSize: { value: size },
      uReveal: { value: 0 },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uDepth: { value: DEPTH },
      uFog: { value: GROUND },
      uContrast: { value: CONTRAST },
      uSaturation: { value: SATURATION },
      uOverlap: { value: OVERLAP },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aTile;
      attribute vec3 aScatter;
      attribute float aDelay;

      uniform sampler2D uMap;
      uniform vec2 uGrid;
      uniform vec2 uSize;
      uniform float uReveal;
      uniform float uTime;
      uniform float uDepth;
      uniform float uOverlap;

      varying vec2 vUv;
      varying vec2 vLocal;
      varying float vFog;

      void main() {
        vec2 cell = uSize / uGrid;
        vec2 centre = (aTile + 0.5) / uGrid;

        /* One texel per tile, read in the vertex shader: the tile's own
           brightness is what pushes it out of the wall. The level has to
           be named, since a vertex shader has no derivatives to pick a
           mip from. */
        vec3 shot = textureLod(uMap, centre, 0.0).rgb;
        float lum = dot(shot, vec3(0.299, 0.587, 0.114));

        vec2 planar = (centre - 0.5) * uSize;
        /* A shallow bow, so the wall is a surface catching the light
           across it rather than a sticker facing straight out */
        float bow = -(planar.x * planar.x) / (uSize.x * 2.6);

        /* Each tile arrives on its own beat, late ones still travelling
           while the early ones have already locked in */
        float t = clamp((uReveal - aDelay * 0.35) / 0.65, 0.0, 1.0);
        float ease = t * t * (3.0 - 2.0 * t);

        vec3 home = vec3(planar, bow + (lum - 0.5) * uDepth * ease);
        vec3 pos = home + aScatter * (1.0 - ease);
        pos.y += sin(uTime * 0.6 + aDelay * 12.0) * 0.045 * (1.0 - ease);

        /* Tiles start small and grow into their cell, so a loose tile
           reads as a speck of the room and not as a torn-off poster.
           Settled tiles overrun it: see OVERLAP. */
        vec2 quad = position.xy * cell * mix(0.35, uOverlap, ease);

        vec4 mv = modelViewMatrix * vec4(pos + vec3(quad, 0.0), 1.0);
        gl_Position = projectionMatrix * mv;

        /* The uv spills by exactly as much as the quad does, so a tile's
           overrun shows its neighbour's own pixels rather than a stretched
           copy of its own, and the join has nothing to give itself away */
        vUv = (aTile + 0.5 + position.xy * uOverlap) / uGrid;
        /* Where this fragment sits inside the tile's own cell: ±0.5 is the
           cell edge, anything past it is the overrun. */
        vLocal = position.xy * uOverlap;
        /* Starts further back and never gets far: fog is depth, but every
           point of it is a point of the film turned to cream, and a screen
           is only ever this far away because you are on your way to it. */
        vFog = clamp((-mv.z - 11.0) / 30.0, 0.0, 0.22);
      }
    `,
    fragmentShader: /* glsl */ `
      /* GLSL ES 3.00 has no built-in fragment output, and three only
         declares one for its own materials. The alias is what the shared
         colorspace chunk below writes through. */
      layout(location = 0) out highp vec4 pc_fragColor;
      #define gl_FragColor pc_fragColor

      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uReveal;
      uniform vec3 uFog;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uOverlap;

      varying vec2 vUv;
      varying vec2 vLocal;
      varying float vFog;

      void main() {
        vec3 shot = texture(uMap, vUv).rgb;

        /* The grade. Saturation swings around the frame's own luminance so
           the cream ceiling and the white plates stay neutral while the
           chilli and turmeric come up; the contrast swings around mid-grey
           so the oil goes darker as the crust goes brighter, which is what
           reads as depth rather than as exposure. */
        float luma = dot(shot, vec3(0.299, 0.587, 0.114));
        shot = mix(vec3(luma), shot, uSaturation);
        shot = clamp((shot - 0.5) * uContrast + 0.5, 0.0, 1.0);

        /* Feathered rather than cut: the film has no frame around it, it
           just stops being there toward the edges of the wall. Written
           the forward way round because GLSL leaves smoothstep undefined
           when its edges are reversed. */
        vec2 edge = abs(vUv - 0.5) * 2.0;
        float fade = 1.0 - smoothstep(0.72, 1.0, max(edge.x, edge.y));

        /* Hand the shared band over.
           Each tile owns its cell outright and gives up its overrun across
           the seam, on a curve whose two halves sum to one — so at every
           point of the band this tile's weight and its neighbour's are
           exactly a whole tile between them. */
        float band = (uOverlap - 1.0) * 0.5;
        vec2 give = vec2(
          1.0 - smoothstep(0.5 - band, 0.5 + band, abs(vLocal.x)),
          1.0 - smoothstep(0.5 - band, 0.5 + band, abs(vLocal.y))
        );
        float weight = give.x * give.y;

        /* Weighting the alpha directly would not do: two layers at half
           strength do not compose to one layer at full, they compose to
           three quarters of it, and the band would go dark instead of
           bright. Transmittance is what multiplies, so the weight belongs
           in the exponent — the pair then leaves exactly (1 - a) behind,
           whatever the split, and the seam has nothing to show. */
        float want = min(uOpacity * uReveal * fade, 0.999);
        float a = 1.0 - pow(1.0 - want, weight);

        /* Well above zero: a screen damping out of its beat would
           otherwise leave a field of near-invisible tiles hanging in the
           corridor behind the next one. */
        if (a < 0.04) discard;

        gl_FragColor = vec4(mix(shot, uFog, vFog), a);
        #include <colorspace_fragment>
      }
    `,
  });
}

interface FilmDeckProps {
  /** Whether the world is near enough to be worth decoding a film for */
  awake: boolean;
  /** The six screens as this flight frames them */
  screens: FilmScreen[];
  grid: TileGrid;
}

export default function FilmDeck({ awake, screens, grid }: FilmDeckProps) {
  const video = useMemo(() => {
    const element = document.createElement("video");
    element.muted = true;
    element.defaultMuted = true;
    element.loop = false;
    element.playsInline = true;
    element.preload = "auto";
    /* Nothing reads pixels back, but the film is same-origin anyway */
    element.crossOrigin = "anonymous";
    return element;
  }, []);

  const texture = useMemo(() => {
    const created = new THREE.VideoTexture(video);
    created.colorSpace = THREE.SRGBColorSpace;
    created.minFilter = THREE.LinearFilter;
    created.magFilter = THREE.LinearFilter;
    created.generateMipmaps = false;
    return created;
  }, [video]);

  const geometry = useMemo(() => createTileGeometry(grid), [grid]);

  const materials = useMemo(
    () =>
      screens.map((screen) =>
        createScreenMaterial(
          texture,
          new THREE.Vector2(screen.width, screen.width / FILM_ASPECT),
          screen.opacity,
          grid,
        ),
      ),
    [texture, screens, grid],
  );

  /** Which segment is playing, so a beat only cues its shot once */
  const playing = useRef(-1);
  /** Seconds since the last seek, so a refused one is not asked again at 60Hz */
  const sinceCue = useRef(0);
  /** Held at nothing until a frame has actually been decoded */
  const ready = useRef(0);

  /* The pieces that are written to every frame are reached through refs
     rather than through the values the effect above closes over: the deck
     only drives a player, and only paints screens, while it is mounted. */
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const screenRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);

  /*
   * The deck asks for the film only once the world is awake, and the hero
   * has been playing the same URL since long before that — so this is a
   * read from the cache rather than a second download of the same file
   * across the hero's own connection.
   *
   * Nothing plays it here: the frame loop below owns that, and the frame
   * loop only runs while the world is awake, so a sleeping world holds a
   * decoder that is doing nothing at all.
   */
  useEffect(() => {
    if (!awake || video.getAttribute("src")) return;
    /* Through the attribute, as the teardown below takes it away again */
    video.setAttribute("src", FILM_SRC);
    video.load();
  }, [awake, video]);

  useEffect(() => {
    playerRef.current = video;
    return () => {
      playerRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      geometry.dispose();
      for (const material of materials) material.dispose();
    };
  }, [video, texture, geometry, materials]);

  useFrame((_, delta) => {
    const p = worldState.progress;

    /* Whichever screen is most present owns the decoder */
    let strongest = 0;
    let index = 0;
    for (let i = 0; i < screens.length; i += 1) {
      const o = bandOpacity(p, screens[i].band);
      if (o > strongest) {
        strongest = o;
        index = i;
      }
    }

    const player = playerRef.current;
    const decoded = player !== null && player.readyState >= 2;
    ready.current = THREE.MathUtils.damp(ready.current, decoded ? 1 : 0, 5, delta);

    if (player && decoded) {
      const [from, to] = screens[index].segment;
      sinceCue.current += delta;

      const cue = () => {
        player.playbackRate = segmentRate(screens[index].segment);
        player.currentTime = from;
        sinceCue.current = 0;
      };

      if (playing.current !== index) {
        playing.current = index;
        cue();
      } else if (player.seeking) {
        /* Leave it alone while it is working */
      } else if (player.currentTime >= to) {
        /* Each beat loops its own stretch rather than running on into the
           next beat's shot */
        cue();
      } else if (sinceCue.current > 0.6 && player.currentTime < from - 0.25) {
        /* The seek did not take — a decoder can refuse one until enough of
           the file is buffered, and it reports itself as not seeking while
           it does. Ask again, but at walking pace: asking every frame is
           how a film ends up pinned to its first frame, each request
           cancelling the one before it. */
        cue();
      }

      /* Paused while the world is off screen: a decoder running behind a
         page nobody is looking at is a battery bill */
      if (worldState.active && player.paused) {
        void player.play().catch(() => {});
      } else if (!worldState.active && !player.paused) {
        player.pause();
      }
    }

    for (let i = 0; i < screens.length; i += 1) {
      const screen = screenRefs.current[i];
      if (!screen) continue;
      screen.uniforms.uTime.value += delta;
      const target = bandOpacity(p, screens[i].band) * ready.current;
      screen.uniforms.uReveal.value = THREE.MathUtils.damp(
        screen.uniforms.uReveal.value,
        target,
        3.5,
        delta,
      );
    }
  });

  return (
    <>
      {screens.map((screen, i) => (
        <mesh
          key={screen.id}
          geometry={geometry}
          position={screen.position}
          rotation={screen.rotation}
          frustumCulled={false}
          /* Behind the dust and behind the packs, always */
          renderOrder={-1}
        >
          <primitive
            ref={(material: THREE.ShaderMaterial | null) => {
              screenRefs.current[i] = material;
            }}
            object={materials[i]}
            attach="material"
          />
        </mesh>
      ))}
    </>
  );
}
