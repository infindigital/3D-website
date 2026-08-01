"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

interface PackModelProps {
  /** Public URL of the owner-supplied package front artwork */
  front: string;
  /** Public URL of the back artwork, front is reused when missing */
  back?: string;
  onSelect?: () => void;
}

/**
 * A masala sachet built from the owner-supplied package artwork: two gently
 * pillowed planes back to back with a laminate-style clearcoat so the studio
 * lights glide across the film. The textures are exactly the files the owner
 * uploads, artwork is never generated.
 */
export default function PackModel({ front, back, onSelect }: PackModelProps) {
  const textures = useTexture(back ? [front, back] : [front], (loaded) => {
    for (const texture of Array.isArray(loaded) ? loaded : [loaded]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    }
  });
  const [frontMap, backMap = frontMap] = textures;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1.4, 28, 36);
    const position = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i += 1) {
      const u = position.getX(i) + 0.5;
      const v = position.getY(i) / 1.4 + 0.5;
      // Pillowed film with the crimp flattening toward top and bottom seals
      const pillow =
        Math.sin(Math.PI * u) * Math.pow(Math.sin(Math.PI * v), 0.55);
      position.setZ(i, pillow * 0.09);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Ignore clicks that were actually drags on the presentation controls
    if (!onSelect || event.delta > 4) return;
    event.stopPropagation();
    onSelect();
  };

  return (
    <group onClick={handleClick}>
      <mesh geometry={geometry} position={[0, 0, 0.012]}>
        <meshPhysicalMaterial
          map={frontMap}
          roughness={0.5}
          clearcoat={0.55}
          clearcoatRoughness={0.35}
        />
      </mesh>
      <mesh geometry={geometry} rotation={[0, Math.PI, 0]} position={[0, 0, -0.012]}>
        <meshPhysicalMaterial
          map={backMap}
          roughness={0.5}
          clearcoat={0.55}
          clearcoatRoughness={0.35}
        />
      </mesh>
    </group>
  );
}
