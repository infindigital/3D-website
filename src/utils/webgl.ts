/**
 * One-time WebGL capability probe. The 3D layers are pure enhancement,
 * so anything without a context simply never mounts them.
 */
let cached: boolean | null = null;

export function supportsWebGL(): boolean {
  if (cached !== null) return cached;

  /*
   * A page opened straight off the disk has a context and still cannot use
   * it. Every file:// document is its own opaque origin, so a texture read
   * from a neighbouring file counts as cross-origin data and texImage2D
   * refuses it outright:
   *
   *   SecurityError: The image element contains cross-origin data,
   *   and may not be loaded.
   *
   * That is a browser rule, not something a build can route around. The
   * packs are textures, so the first one thrown takes the render loop with
   * it and the page dies — where reporting no WebGL costs only the 3D and
   * leaves the CSS world, which is exactly what this flag is for.
   */
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "file:"
  ) {
    cached = false;
    return cached;
  }

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
