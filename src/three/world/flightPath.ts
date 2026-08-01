import * as THREE from "three";

/**
 * The shape of the world, in one place, because two very different things
 * have to agree on it: the camera flies this path, and the HTML overlay
 * fades its copy in and out against the same progress numbers. Change a
 * beat here and both move together.
 *
 * The world is a corridor running away down -Z. The camera never turns
 * back, so a pack that has to be seen twice simply exists twice: this is a
 * flight through a memory of the kitchen, not a room you could walk.
 */

/**
 * Camera positions at evenly spaced progress values, 0 to 1.
 *
 * Every one of these is a framing decision, not a coordinate: the distance
 * sets how much of the screen the pack fills, and the target is aimed off
 * to one side of the pack so the pack lands on the half of the frame the
 * copy panel has left free. Moving a key without re-checking both is how
 * a panel ends up printed across a pack.
 */
const CAMERA_KEYS: [number, number, number][] = [
  [0, 0.25, 8.6], //     0.000  the lineup, seen from across the room
  [0, 0.18, 4.0], //     0.167  pushing in between the two packs
  [0, 0.1, -5.5], //     0.333  through, down the open corridor
  [-2.6, 0.2, -8.9], //  0.500  swung left, first pack out to the right
  [2.6, 0.2, -15.9], //  0.667  swung right, second pack out to the left
  [0, 0.5, -25.4], //    0.833  lifted, facing the three rings
  [0, 0.5, -30.6], //    1.000  pulled back, both packs together again
];

/** Where the camera looks at those same progress values */
const TARGET_KEYS: [number, number, number][] = [
  [0, 0, 0],
  [0, 0, -1],
  [0, 0.05, -11],
  [-3.4, 0, -15.6],
  [3.4, 0, -22.6],
  [0, 0.05, -29.8],
  [0, 0, -36.6],
];

const toCurve = (keys: [number, number, number][]) =>
  new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k)),
    false,
    "centripetal",
    0.5,
  );

export const cameraCurve = toCurve(CAMERA_KEYS);
export const targetCurve = toCurve(TARGET_KEYS);

/**
 * Every pack in the world. `product` indexes into the packs handed to the
 * canvas; a slot whose product is missing is simply not drawn, which is how
 * the world stays correct when only one artwork file has been supplied.
 */
export interface PackSlot {
  id: string;
  product: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  /**
   * Progress at which this pack grows into the world, for slots that stand
   * far enough down the corridor to be seen over the top of an earlier
   * beat. Without it the closing pair hangs in the distance behind the
   * ritual, arguing with the headline in front of it.
   */
  revealFrom?: number;
}

export const PACK_SLOTS: PackSlot[] = [
  { id: "lineup-0", product: 0, position: [-2.8, 0.05, 0], rotation: [0, 0.2, 0.03], scale: 1.5 },
  { id: "lineup-1", product: 1, position: [2.8, 0.05, 0], rotation: [0, -0.2, -0.03], scale: 1.5 },
  { id: "flavour-0", product: 0, position: [-1.35, 0, -15.2], rotation: [0, -0.26, 0.02], scale: 1.8 },
  { id: "flavour-1", product: 1, position: [1.35, 0, -22.2], rotation: [0, 0.26, -0.02], scale: 1.8 },
  { id: "finale-0", product: 0, position: [-2.6, 0, -36.6], rotation: [0, 0.24, 0.02], scale: 1.5, revealFrom: 0.88 },
  { id: "finale-1", product: 1, position: [2.6, 0, -36.6], rotation: [0, -0.24, -0.02], scale: 1.5, revealFrom: 0.88 },
];

/**
 * Accent colour of the travelling key light, keyed to progress. It carries
 * the mood from turmeric through each product's own accent and out into the
 * green of the promise.
 */
export const LIGHT_KEYS: { at: number; color: string }[] = [
  { at: 0, color: "#f5b301" },
  { at: 0.33, color: "#f2860d" },
  { at: 0.5, color: "#e63324" },
  { at: 0.67, color: "#f2860d" },
  { at: 0.85, color: "#f5b301" },
  { at: 1, color: "#009b4c" },
];
