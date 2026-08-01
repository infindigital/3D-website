"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "./worldState";
import {
  RITUAL_RINGS,
  RITUAL_RING_RADIUS,
  RITUAL_ZONE,
} from "./flightPath";

/**
 * The ground spice hanging in the air of the whole corridor: one instanced
 * draw call for several thousand specks, every one of them moved entirely
 * on the GPU. Nothing here touches the CPU per frame except six uniforms.
 *
 * Two things make it feel like a place rather than a particle demo. The
 * specks stretch along the direction they are flying past the lens when you
 * scroll fast, so speed reads as motion blur instead of as teleporting. And
 * the dust hanging over the ritual stretch of the corridor gathers itself
 * into three slow rings as you arrive there, so the same spice you flew
 * through becomes the three steps of the recipe.
 */

const COUNT = 3400;

/**
 * Warm spice tones, weighted by repetition: mostly chilli and turmeric with
 * roasted browns between them, and a single curry-leaf green in ten. An
 * even spread of all six reads as confetti rather than as ground powder.
 */
const PALETTE = [
  "#e63324",
  "#f2860d",
  "#f5b301",
  "#b4471c",
  "#8c5a2b",
  "#e63324",
  "#c2410c",
  "#f5b301",
  "#8c5a2b",
  "#009b4c",
];

/**
 * How far the field spreads around the corridor. Kept close to the flight
 * path rather than filling the whole world: spread wide, the same number of
 * specks becomes a thin haze nobody can see, and the ones far off to the
 * side are never in frame anyway.
 */
const SPREAD_X = 5.5;
const SPREAD_Y = 3.4;
const Z_NEAR = 6;
const Z_FAR = -40;

/**
 * A fixed sequence rather than Math.random, so the field is laid out
 * identically on every load: a distribution that looks right stays right,
 * and a screenshot of the world is worth comparing against the next one.
 */
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

interface SpiceFieldProps {
  /** Written every frame by the rig so the shader knows how fast we travel */
  streakRef: { current: number };
}

export default function SpiceField({ streakRef }: SpiceFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, material } = useMemo(() => {
    /* One quad, drawn COUNT times. The quad's own attributes are shared
       rather than copied, so the base geometry must not be disposed. */
    const base = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.setIndex(base.index);
    geo.setAttribute("position", base.attributes.position);
    geo.setAttribute("uv", base.attributes.uv);
    geo.instanceCount = COUNT;

    const offset = new Float32Array(COUNT * 3);
    const gather = new Float32Array(COUNT * 3);
    const ring3 = new Float32Array(COUNT * 3);
    const color = new Float32Array(COUNT * 3);
    const scale = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const gatherMask = new Float32Array(COUNT);

    const tint = new THREE.Color();
    const random = makeRandom(20260801);

    for (let i = 0; i < COUNT; i += 1) {
      const x = (random() * 2 - 1) * SPREAD_X;
      const y = (random() * 2 - 1) * SPREAD_Y;
      const z = Z_NEAR + random() * (Z_FAR - Z_NEAR);

      offset[i * 3] = x;
      offset[i * 3 + 1] = y;
      offset[i * 3 + 2] = z;

      tint.set(PALETTE[Math.floor(random() * PALETTE.length)]);
      color[i * 3] = tint.r;
      color[i * 3 + 1] = tint.g;
      color[i * 3 + 2] = tint.b;

      /* A few larger flakes among many fine grains reads as real powder.
         These are half-widths in world units at the speck's own depth:
         much below 0.025 a grain lands on a single pixel and antialiases
         itself into nothing, and much above 0.1 it stops being dust. */
      const fine = random();
      scale[i] = fine > 0.97 ? 0.075 + random() * 0.045 : 0.025 + fine * 0.038;
      seed[i] = random();

      if (z > RITUAL_ZONE[0] && z < RITUAL_ZONE[1]) {
        const ring = RITUAL_RINGS[i % RITUAL_RINGS.length];
        const angle = random() * Math.PI * 2;
        /* A band, not a wire: the ring has thickness and a little wobble.
           Narrow, though — much wider and the hole in the middle closes
           and the ring stops being a ring. */
        const radius = RITUAL_RING_RADIUS * (0.88 + random() * 0.18);
        gather[i * 3] = ring[0] + Math.cos(angle) * radius;
        gather[i * 3 + 1] = ring[1] + Math.sin(angle) * radius;
        gather[i * 3 + 2] = ring[2] + (random() * 2 - 1) * 0.12;
        /* The ring's own centre travels with it: the spin in the shader
           has to turn each ring about itself, not about the world axis,
           or the three of them smear into one disc. */
        ring3[i * 3] = ring[0];
        ring3[i * 3 + 1] = ring[1];
        ring3[i * 3 + 2] = ring[2];
        gatherMask[i] = 1;
      }
    }

    const instanced = (data: Float32Array, size: number) =>
      new THREE.InstancedBufferAttribute(data, size);

    geo.setAttribute("aOffset", instanced(offset, 3));
    geo.setAttribute("aGather", instanced(gather, 3));
    geo.setAttribute("aRing", instanced(ring3, 3));
    geo.setAttribute("aColor", instanced(color, 3));
    geo.setAttribute("aScale", instanced(scale, 1));
    geo.setAttribute("aSeed", instanced(seed, 1));
    geo.setAttribute("aGatherMask", instanced(gatherMask, 1));

    /* Frustum culling uses the base plane's bounds, which are one unit
       wide, so the whole field would pop out of view. The field is always
       on screen by design, so give it bounds that say so. */
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -17), 60);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uStreak: { value: 0 },
        uGather: { value: 0 },
        uAlpha: { value: 0.5 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aOffset;
        attribute vec3 aGather;
        attribute vec3 aRing;
        attribute vec3 aColor;
        attribute float aScale;
        attribute float aSeed;
        attribute float aGatherMask;

        uniform float uTime;
        uniform float uStreak;
        uniform float uGather;

        varying vec3 vColor;
        varying vec2 vUv;
        varying float vGathered;

        void main() {
          float t = uTime;
          float phase = aSeed * 6.2831853;

          vec3 p = aOffset;
          /* Cheap swirl: three offset sines read as turbulence at this
             density, and cost a fraction of real curl noise. */
          p += vec3(
            sin(p.y * 0.70 + t * 0.33 + phase),
            cos(p.x * 0.61 + t * 0.27 + phase * 1.7),
            sin(p.x * 0.45 + t * 0.21 + phase * 2.3)
          ) * 0.34;
          p.y += sin(t * 0.2 + phase) * 0.22;

          float g = uGather * aGatherMask;
          if (g > 0.0) {
            /* Each ring turns slowly about its own centre once it has formed */
            float a = t * 0.25;
            float ca = cos(a);
            float sa = sin(a);
            vec2 rel = aGather.xy - aRing.xy;
            vec3 spun = vec3(
              aRing.x + rel.x * ca - rel.y * sa,
              aRing.y + rel.x * sa + rel.y * ca,
              aGather.z
            );
            p = mix(p, spun, g);
          }

          vec4 mv = modelViewMatrix * vec4(p, 1.0);

          /* Stretch along the direction this speck slides past the lens.
             The camera flies down its own -Z, so on screen everything
             slides radially out from the centre, which in view space is
             just the speck's own offset from the view axis.

             Written as a matrix rather than as two scaled basis vectors
             added together: the added form is the same rotation on paper,
             but some drivers lose the quad entirely, and a vertex that
             lands nowhere is not an error anyone gets told about. */
          float radial = length(mv.xy);
          vec2 dir = radial > 0.0001 ? mv.xy / radial : vec2(0.0, 1.0);
          mat2 frame = mat2(dir.y, -dir.x, dir.x, dir.y);

          /* Gathered grains are drawn finer, not coarser. A ring this size
             is only a couple of hundred pixels across; at the drifting
             grain size it would be eight blobs in a circle. */
          float s = aScale * mix(1.0, 0.55, g);
          float stretch = 1.0 + uStreak * 5.0 * (1.0 - g);
          mv.xy += frame * (position.xy * vec2(s, s * stretch));

          gl_Position = projectionMatrix * mv;

          vColor = aColor;
          vUv = uv;
          vGathered = g;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;

        varying vec3 vColor;
        varying vec2 vUv;
        varying float vGathered;

        void main() {
          float d = length(vUv - 0.5) * 2.0;
          /* Written the long way round on purpose: GLSL leaves smoothstep
             undefined when edge0 > edge1, and drivers that return zero for
             it discard every fragment, which is a field of nothing. */
          float a = 1.0 - smoothstep(0.1, 1.0, d);
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor, a * uAlpha * mix(0.7, 1.0, vGathered));
          #include <colorspace_fragment>
        }
      `,
    });

    return { geometry: geo, material: mat };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    const uniforms = materialRef.current?.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value += delta;
    uniforms.uStreak.value = streakRef.current;

    /* The rings form as the ritual beat arrives and let go again after it,
       so the dust is only ever briefly organised. */
    const p = worldState.progress;
    const gathered =
      THREE.MathUtils.smoothstep(p, 0.7, 0.8) *
      (1 - THREE.MathUtils.smoothstep(p, 0.9, 0.97));
    uniforms.uGather.value = THREE.MathUtils.damp(
      uniforms.uGather.value,
      gathered,
      4,
      delta,
    );
  });

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={2}>
      <primitive ref={materialRef} object={material} attach="material" />
    </mesh>
  );
}
