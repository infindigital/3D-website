"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A single-draw-call field of drifting spice grains rendered with a custom
 * point shader. Grains swirl slowly on their own, lean toward the pointer by
 * depth, rise as the page scrolls and fade out near the headline so the type
 * stays clean. Everything is procedural, no textures, so it works before any
 * generated media lands.
 */

/** Warm spice tones that keep contrast against the bright cream background */
const PALETTE = ["#e63324", "#f2860d", "#f5b301", "#b0561b", "#8c3a12"];

/** Raw sRGB triplet, bypassing three's color management so the shader
 *  writes exactly these values to the sRGB framebuffer. */
function srgbTriplet(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

/** Deterministic PRNG so the field lays out identically on every visit */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vFade;

  void main() {
    vColor = aColor;

    vec3 pos = position;
    float t = uTime * aSpeed;

    pos.x += sin(t * 0.9 + aPhase) * 0.5;
    pos.y += sin(t * 0.6 + aPhase * 1.7) * 0.65;
    pos.z += cos(t * 0.5 + aPhase) * 0.35;

    // Scroll lifts grains at depth-dependent speed, selling the parallax
    pos.y += uScroll * (2.2 + position.z * 0.6);

    // Pointer parallax, near grains move more
    float depth = (position.z + 3.0) / 5.0;
    pos.x += uPointer.x * depth * 0.7;
    pos.y -= uPointer.y * depth * 0.45;

    // Keep the centre clear for the headline, fade near vertical edges
    float centre = smoothstep(1.5, 3.4, length(pos.xy * vec2(0.85, 1.6)));
    float edges = smoothstep(-6.5, -4.2, pos.y) * smoothstep(6.5, 4.2, pos.y);
    vFade = centre * edges;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (10.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = pow(smoothstep(0.5, 0.05, d), 1.5) * uOpacity * vFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function buildAttributes(count: number) {
  const random = mulberry32(20260801);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (random() - 0.5) * 16;
    positions[i * 3 + 1] = (random() - 0.5) * 9;
    positions[i * 3 + 2] = -3 + random() * 5;

    const [r, g, b] = srgbTriplet(
      PALETTE[Math.floor(random() * PALETTE.length)],
    );
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;

    sizes[i] = 5 + random() * 12;
    phases[i] = random() * Math.PI * 2;
    speeds[i] = 0.35 + random() * 0.5;
  }

  return { positions, colors, sizes, phases, speeds };
}

export default function SpiceField({ count = 380 }: { count?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const attributes = useMemo(() => buildAttributes(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const p = pointer.current;
    const ease = Math.min(1, delta * 2.5);
    p.x += (p.targetX - p.x) * ease;
    p.y += (p.targetY - p.y) * ease;

    const u = material.uniforms;
    u.uTime.value += delta;
    u.uPointer.value.set(p.x, p.y);
    u.uScroll.value = Math.min(
      1,
      Math.max(0, window.scrollY / window.innerHeight),
    );
    u.uOpacity.value = Math.min(0.85, u.uOpacity.value + delta * 0.4);
    u.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry key={count}>
        <bufferAttribute
          attach="attributes-position"
          args={[attributes.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aColor"
          args={[attributes.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[attributes.sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[attributes.phases, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[attributes.speeds, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
