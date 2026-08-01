/**
 * The single channel between the scrolling page and the 3D world.
 *
 * The overlay writes to it from a ScrollTrigger, the scene reads it inside
 * useFrame. It is deliberately a plain mutable object rather than React
 * state: the camera has to follow the scroll every frame, and routing that
 * through a re-render would cost a reconciliation per frame and still
 * arrive a frame late.
 */
export const worldState = {
  /** 0 to 1 across the whole world region */
  progress: 0,
  /** Pointer over the window, -1 to 1 on each axis, 0 at the centre */
  pointerX: 0,
  pointerY: 0,
  /**
   * Whether the world is the part of the page being looked at. The film
   * stops decoding when it is not, which is the difference between a video
   * running for the whole visit and one running while it is watched.
   */
  active: false,
};
