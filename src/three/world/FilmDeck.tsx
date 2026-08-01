"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "./worldState";
import { bandOpacity } from "./bands";
import {
  FILM_ASPECT,
  FILM_SCREENS,
  FILM_SRC,
  segmentRate,
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
 * That is what makes it part of the room: the packs stand in front of it,
 * the spice drifts across it, and the travelling light passes over it.
 */

const COLS = 30;
const ROWS = 17;
const TILES = COLS * ROWS;

/** How far the brightest part of a shot stands out from the darkest.
 *  Kept small on purpose: relief is what stops the wall reading as a
 *  sticker, but past a point the tiles pull apart and it reads as a
 *  broken mosaic instead of a film. */
const DEPTH = 0.2;

/** The page's cream, mixed in with distance so a far screen sits back */
const CREAM = new THREE.Color("#fff8ee");

/** A fixed sequence, so the tiles scatter the same way on every load */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createTileGeometry(): THREE.InstancedBufferGeometry {
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
      uFog: { value: CREAM },
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

      varying vec2 vUv;
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
           Settled tiles fill the cell exactly — anything less and every
           tile edge in the wall shows as a cream seam. */
        vec2 quad = position.xy * cell * mix(0.35, 1.0, ease);

        vec4 mv = modelViewMatrix * vec4(pos + vec3(quad, 0.0), 1.0);
        gl_Position = projectionMatrix * mv;

        /* Full cell rather than the drawn 0.985, so neighbouring tiles
           share an edge exactly and the image has no seams */
        vUv = (aTile + position.xy + 0.5) / uGrid;
        vFog = clamp((-mv.z - 7.0) / 26.0, 0.0, 0.55);
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

      varying vec2 vUv;
      varying float vFog;

      void main() {
        vec3 shot = texture(uMap, vUv).rgb;

        /* Feathered rather than cut: the film has no frame around it, it
           just stops being there toward the edges of the wall. Written
           the forward way round because GLSL leaves smoothstep undefined
           when its edges are reversed. */
        vec2 edge = abs(vUv - 0.5) * 2.0;
        float fade = 1.0 - smoothstep(0.72, 1.0, max(edge.x, edge.y));

        float a = uOpacity * uReveal * fade;
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

export default function FilmDeck() {
  const video = useMemo(() => {
    const element = document.createElement("video");
    element.src = FILM_SRC;
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

  const geometry = useMemo(() => createTileGeometry(), []);

  const materials = useMemo(
    () =>
      FILM_SCREENS.map((screen) =>
        createScreenMaterial(
          texture,
          new THREE.Vector2(screen.width, screen.width / FILM_ASPECT),
          screen.opacity,
        ),
      ),
    [texture],
  );

  /** Which segment is playing, so a beat only cues its shot once */
  const playing = useRef(-1);
  /** Held at nothing until a frame has actually been decoded */
  const ready = useRef(0);

  /* The pieces that are written to every frame are reached through refs
     rather than through the values the effect above closes over: the deck
     only drives a player, and only paints screens, while it is mounted. */
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const screenRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);

  useEffect(() => {
    playerRef.current = video;
    void video.play().catch(() => {
      /* Autoplay of a muted video is allowed everywhere that matters; if
         a browser still says no, the wall simply stays on one frame. */
    });
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
    for (let i = 0; i < FILM_SCREENS.length; i += 1) {
      const o = bandOpacity(p, FILM_SCREENS[i].band);
      if (o > strongest) {
        strongest = o;
        index = i;
      }
    }

    const player = playerRef.current;
    const decoded = player !== null && player.readyState >= 2;
    ready.current = THREE.MathUtils.damp(ready.current, decoded ? 1 : 0, 5, delta);

    if (player && decoded) {
      const [from, to] = FILM_SCREENS[index].segment;

      if (playing.current !== index) {
        playing.current = index;
        player.playbackRate = segmentRate(FILM_SCREENS[index].segment);
        player.currentTime = from;
      } else if (!player.seeking && (player.currentTime >= to || player.currentTime < from - 0.1)) {
        /* Each beat loops its own stretch rather than running on into the
           next beat's shot */
        player.currentTime = from;
      }

      /* Paused while the world is off screen: a decoder running behind a
         page nobody is looking at is a battery bill */
      if (worldState.active && player.paused) {
        void player.play().catch(() => {});
      } else if (!worldState.active && !player.paused) {
        player.pause();
      }
    }

    for (let i = 0; i < FILM_SCREENS.length; i += 1) {
      const screen = screenRefs.current[i];
      if (!screen) continue;
      screen.uniforms.uTime.value += delta;
      const target = bandOpacity(p, FILM_SCREENS[i].band) * ready.current;
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
      {FILM_SCREENS.map((screen, i) => (
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
