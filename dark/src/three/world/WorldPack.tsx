"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { worldState } from "./worldState";
import type { PackSlot } from "./flightPath";

/**
 * One sachet standing in the world. The artwork is exactly the file the
 * owner supplied; nothing about the pack is invented except the shape of
 * the film it is printed on.
 *
 * The pack answers the pointer twice over: it leans toward wherever the
 * pointer is in the window, which keeps every pack in the scene alive at
 * once, and it lifts and squares up to the lens when the pointer is
 * actually on it.
 */

/** Pillowed sachet film, built once and shared by every pack in the world */
export function createPackGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1, 1.4, 28, 36);
  const position = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i += 1) {
    const u = position.getX(i) + 0.5;
    const v = position.getY(i) / 1.4 + 0.5;
    // Pillowed film with the crimp flattening toward the top and bottom seals
    const pillow = Math.sin(Math.PI * u) * Math.pow(Math.sin(Math.PI * v), 0.55);
    position.setZ(i, pillow * 0.09);
  }
  geo.computeVertexNormals();
  return geo;
}

interface WorldPackProps {
  slot: PackSlot;
  geometry: THREE.BufferGeometry;
  front: THREE.Texture;
  back: THREE.Texture;
  accent: string;
  label: string;
  onSelect: () => void;
}

export default function WorldPack({
  slot,
  geometry,
  front,
  back,
  accent,
  label,
  onSelect,
}: WorldPackProps) {
  const group = useRef<THREE.Group>(null);
  const rim = useRef<THREE.PointLight>(null);
  const shadowRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const shadowMaterial = useMemo(() => makeShadowMaterial(), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    /* Everything is damped rather than lerped by a fixed factor, so the
       lean settles in the same time on a 60Hz laptop and a 144Hz monitor. */
    const lean = hovered ? 0.35 : 1;
    /* Half a turn across the beat that names it, so the recipes the panel
       promises are on the back are actually shown. Damped like everything
       else here, so scrolling back through the beat turns it back. */
    const turn = slot.turnOver
      ? Math.PI * THREE.MathUtils.smoothstep(worldState.progress, slot.turnOver[0], slot.turnOver[1])
      : 0;
    const targetY =
      slot.rotation[1] +
      turn +
      worldState.pointerX * 0.26 * lean -
      (hovered ? slot.rotation[1] * 0.8 : 0);
    const targetX = -worldState.pointerY * 0.14 * lean;

    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 5, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 5, delta);

    /* A slow bob so a pack is never perfectly still, plus a lift on hover */
    const bob = Math.sin(performance.now() * 0.0006 + slot.position[0]) * 0.045;
    g.position.y = THREE.MathUtils.damp(
      g.position.y,
      slot.position[1] + bob + (hovered ? 0.12 : 0),
      6,
      delta,
    );

    /* A slot that stands beyond an earlier beat waits its turn rather than
       hanging in the distance behind someone else's headline — and, where
       the flight is aimed straight at it, leaves again before the camera
       arrives rather than being flown through. */
    const reveal = slot.visible
      ? THREE.MathUtils.smoothstep(worldState.progress, slot.visible[0], slot.visible[0] + 0.06) *
        (1 - THREE.MathUtils.smoothstep(worldState.progress, slot.visible[1] - 0.06, slot.visible[1]))
      : 1;

    const scale = slot.scale * (hovered ? 1.06 : 1) * reveal;
    const eased = THREE.MathUtils.damp(g.scale.x, scale, 6, delta);
    g.scale.setScalar(Math.max(eased, 0.0001));

    /* The pool of shade and the rim light belong to the pack, so they wait
       with it: a shadow under nothing is worse than no shadow at all */
    const shown = eased / slot.scale;
    if (shadowRef.current) shadowRef.current.uniforms.uFade.value = shown;
    if (rim.current) rim.current.intensity = (hovered ? 5.5 : 3.4) * shown;
  });

  /* The cursor lives in the DOM and the pack lives in the canvas, so they
     agree through the one thing both can see. */
  const setHover = (next: boolean) => {
    setHovered(next);
    document.body.dataset.cursor = next ? "pack" : "";
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group position={slot.position}>
      {/* The pack's own rim light, so each one carries its product's colour.
          Held down since nothing tone-maps the top end any more: a rim that
          clips is a white edge, not a coloured one. */}
      <pointLight
        ref={rim}
        position={[0, 1.5, -1.6]}
        intensity={hovered ? 5.5 : 3.4}
        distance={7}
        color={accent}
      />

      <group
        ref={group}
        rotation={slot.rotation}
        scale={slot.scale}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={handleClick}
      >
        <mesh geometry={geometry} position={[0, 0, 0.012]}>
          <meshPhysicalMaterial
            map={front}
            alphaTest={0.5}
            roughness={0.5}
            clearcoat={0.55}
            clearcoatRoughness={0.35}
          />
        </mesh>
        <mesh
          geometry={geometry}
          rotation={[0, Math.PI, 0]}
          position={[0, 0, -0.012]}
        >
          <meshPhysicalMaterial
            map={back}
            alphaTest={0.5}
            roughness={0.5}
            clearcoat={0.55}
            clearcoatRoughness={0.35}
          />
        </mesh>
      </group>

      {/* A soft pool of shade so the pack hangs over something */}
      <mesh
        position={[0, -1.35 * slot.scale * 0.62, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={1}
      >
        <planeGeometry args={[2.4 * slot.scale, 1.7 * slot.scale]} />
        <primitive ref={shadowRef} object={shadowMaterial} attach="material" />
      </mesh>

      {/* Screen readers get the pack as a real, named thing */}
      <group name={label} />
    </group>
  );
}

/**
 * The contact shadow. drei's ContactShadows renders a depth pass per
 * instance, which for six packs is six extra render targets; this is a
 * single transparent quad with a falloff in the fragment shader and costs
 * nothing measurable.
 */
function makeShadowMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      /* Near-black rather than the bright edition's warm brown: on a
         charcoal floor a brown shadow paints a *lighter* patch under the
         pack, which reads as a spill rather than as contact. */
      uColor: { value: new THREE.Color("#050303") },
      uFade: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uFade;
      varying vec2 vUv;
      void main() {
        float d = length((vUv - 0.5) * vec2(1.0, 1.35)) * 2.0;
        /* Not smoothstep(1.0, 0.0, d): GLSL leaves the reversed form
           undefined, and some drivers answer zero for all of it. */
        float a = (1.0 - smoothstep(0.0, 1.0, d)) * 0.28 * uFade;
        if (a < 0.005) discard;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }
    `,
  });
}
