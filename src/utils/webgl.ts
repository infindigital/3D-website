/**
 * One-time WebGL capability probe. The 3D layers are pure enhancement,
 * so anything without a context simply never mounts them.
 */
let cached: boolean | null = null;

export function supportsWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    cached = false;
  }
  return cached;
}
