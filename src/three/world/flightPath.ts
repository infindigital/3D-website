import * as THREE from "three";

/**
 * The shape of the world, in one place, because two very different things
 * have to agree on it: the camera flies this path, and the HTML overlay
 * fades its copy in and out against the same progress numbers. Change a
 * beat here and both move together.
 *
 * There are two of them, because a phone held upright is not a small
 * desktop. The wide flight is a corridor you look *across*: the camera
 * swings left and right so the pack it is looking at keeps one half of the
 * frame and the copy panel keeps the other. Portrait has no other half, so
 * the tall flight is a shaft you fall *down* — the pack always dead centre
 * in the upper half, the words always in the lower. Same six beats, same
 * progress numbers, same film; a different room around them.
 *
 * Neither camera ever turns back, so a pack that has to be seen twice
 * simply exists twice: this is a flight through a memory of the kitchen,
 * not a room you could walk.
 */

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
   * The stretch of progress this pack stands in the world for. Outside it
   * the pack scales away to nothing.
   *
   * Both edges earn their keep. The opening one is for a pack far enough
   * down the world to be seen over the top of an earlier beat: without it
   * the closing pair hangs in the distance behind the ritual, arguing with
   * the headline in front of it. The closing one is what lets the tall
   * flight put a pack dead centre at all — centred means the camera is
   * aimed straight at it, and a camera that keeps going will fly through
   * it. So the pack leaves before the camera arrives, which is also how it
   * reads: a memory the flight has already passed.
   */
  visible?: [number, number];
  /**
   * The stretch of progress across which the pack turns to show its back.
   *
   * The panel beside it says the recipes are printed on the reverse. On the
   * wide flight you can pick a pack up and turn it yourself; on a phone
   * there is nothing to pick up, so the pack turns itself while its own
   * beat is being read, and the claim is shown rather than made.
   */
  turnOver?: [number, number];
}

/** One composed route through the world, with everything framed against it */
export interface Flight {
  cameraCurve: THREE.CatmullRomCurve3;
  targetCurve: THREE.CatmullRomCurve3;
  slots: PackSlot[];
  /**
   * The vertical field of view every distance below was framed at. three's
   * fov is vertical, so framing to it is what makes the tall world hold its
   * composition from a 390px phone to a portrait tablet: the pack keeps the
   * same share of the height and only the room beside it widens.
   */
  fov: number;
}

const toCurve = (keys: [number, number, number][]) =>
  new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k)),
    false,
    "centripetal",
    0.5,
  );

/* ============================================================
   The wide flight — a corridor, looked across
   ============================================================ */

/**
 * Camera positions at evenly spaced progress values, 0 to 1.
 *
 * Every one of these is a framing decision, not a coordinate: the distance
 * sets how much of the screen the pack fills, and the target is aimed off
 * to one side of the pack so the pack lands on the half of the frame the
 * copy panel has left free. Moving a key without re-checking both is how
 * a panel ends up printed across a pack.
 */
const WIDE_CAMERA_KEYS: [number, number, number][] = [
  [0, 0.25, 8.6], //     0.000  the lineup, seen from across the room
  [0, 0.18, 4.0], //     0.167  pushing in between the two packs
  [0, 0.1, -5.5], //     0.333  through, down the open corridor
  [-2.6, 0.2, -8.9], //  0.500  swung left, first pack out to the right
  [2.6, 0.2, -15.9], //  0.667  swung right, second pack out to the left
  [0, 0.5, -25.4], //    0.833  lifted, facing the three rings
  [0, 0.5, -30.6], //    1.000  pulled back, both packs together again
];

/** Where the camera looks at those same progress values */
const WIDE_TARGET_KEYS: [number, number, number][] = [
  [0, 0, 0],
  [0, 0, -1],
  [0, 0.05, -11],
  [-3.4, 0, -15.6],
  [3.4, 0, -22.6],
  [0, 0.05, -29.8],
  [0, 0, -36.6],
];

const WIDE_SLOTS: PackSlot[] = [
  { id: "lineup-0", product: 0, position: [-2.8, 0.05, 0], rotation: [0, 0.2, 0.03], scale: 1.5 },
  { id: "lineup-1", product: 1, position: [2.8, 0.05, 0], rotation: [0, -0.2, -0.03], scale: 1.5 },
  { id: "flavour-0", product: 0, position: [-1.35, 0, -15.2], rotation: [0, -0.26, 0.02], scale: 1.8 },
  { id: "flavour-1", product: 1, position: [1.35, 0, -22.2], rotation: [0, 0.26, -0.02], scale: 1.8 },
  { id: "finale-0", product: 0, position: [-2.6, 0, -36.6], rotation: [0, 0.24, 0.02], scale: 1.5, visible: [0.88, 2] },
  { id: "finale-1", product: 1, position: [2.6, 0, -36.6], rotation: [0, -0.24, -0.02], scale: 1.5, visible: [0.88, 2] },
];

export const WIDE_FLIGHT: Flight = {
  cameraCurve: toCurve(WIDE_CAMERA_KEYS),
  targetCurve: toCurve(WIDE_TARGET_KEYS),
  slots: WIDE_SLOTS,
  fov: 38,
};

/* ============================================================
   The tall flight — a shaft, fallen down
   ============================================================ */

/**
 * Thirteen keys rather than seven, because this camera has to *stop*.
 *
 * The wide flight can hold a beat by swinging past a pack that stands off
 * to one side — the pack stays in frame for as long as the swing takes.
 * Here the pack is straight ahead, so the only way to hold it is to slow
 * down, and the only way to slow a curve sampled at even parameter is to
 * put two keys close together. Every pair below that barely moves is a
 * beat being read; every long stride between them is the flight travelling
 * to the next one.
 *
 * The small sideways numbers are not noise. They are what stops a straight
 * dolly down -Z from reading as a zoom: the room slides across the lens on
 * the way between beats, and comes back to nothing on the beat itself, so
 * every pack is dead centre exactly when it is being talked about.
 */
const TALL_CAMERA_KEYS: [number, number, number][] = [
  [0, 0, 5.0], //         0.000  both packs ahead, the lineup
  [0.16, 0.02, 3.4], //   0.083  easing in
  [0, 0, 1.8], //         0.167  close enough to read the print
  [-0.2, 0.05, -1.5], //  0.250  between them and away, into the shaft
  [0, 0, -5.0], //        0.333  the story, nothing but film
  [0.2, 0.05, -8.5], //   0.417
  [0, 0, -11.6], //       0.500  the first pack, held
  [-0.09, 0.02, -13.6], //0.583  ...and pushed into
  [0, 0, -19.6], //       0.667  the second pack, held
  [0.09, 0.02, -21.6], // 0.750  ...and pushed into
  [0, 0, -27.5], //       0.833  the ritual
  [0, 0.02, -32.0], //    0.917
  [0, 0, -35.4], //       1.000  both packs together again
];

/** Level and straight ahead the whole way down: the packs are lifted to
 *  sit above the lens rather than the lens being tipped up at them, which
 *  keeps every vertical in the world vertical on a screen held upright. */
const TALL_TARGET_KEYS: [number, number, number][] = [
  [0, 0, -2.0],
  [-0.06, 0, -3.6],
  [0, 0, -5.2],
  [0.07, 0, -8.5],
  [0, 0, -12.0],
  [-0.07, 0, -15.5],
  [0, 0, -18.6],
  [0.03, 0, -20.6],
  [0, 0, -26.6],
  [-0.03, 0, -28.6],
  [0, 0, -34.5],
  [0, 0, -39.0],
  [0, 0, -42.4],
];

/**
 * Every pack stands at y 0.75, which is what puts it in the upper half of
 * an upright screen with the copy panel below it. It is a lift rather than
 * a tilt on purpose — see the target keys.
 *
 * The two flavour packs turn over inside their own beat, and are gone
 * before the camera reaches where they stood.
 */
const TALL_SLOTS: PackSlot[] = [
  /* Standing well inside the frame rather than filling it edge to edge: an
     upright screen is barely two and a half units wide where the pair
     stands, so a pack set as far out as the corridor's is a pack with its
     outside edge on the glass. */
  { id: "lineup-0", product: 0, position: [-0.62, 0.75, 0], rotation: [0, 0.26, 0.03], scale: 0.85, visible: [-1, 0.26] },
  { id: "lineup-1", product: 1, position: [0.62, 0.75, 0], rotation: [0, -0.26, -0.03], scale: 0.85, visible: [-1, 0.26] },
  { id: "flavour-0", product: 0, position: [0, 0.75, -18], rotation: [0, -0.16, 0.02], scale: 1.6, visible: [0.42, 0.62], turnOver: [0.5, 0.585] },
  { id: "flavour-1", product: 1, position: [0, 0.75, -26], rotation: [0, 0.16, -0.02], scale: 1.6, visible: [0.58, 0.78], turnOver: [0.665, 0.75] },
  { id: "finale-0", product: 0, position: [-0.68, 0.75, -40], rotation: [0, 0.24, 0.02], scale: 0.9, visible: [0.88, 2] },
  { id: "finale-1", product: 1, position: [0.68, 0.75, -40], rotation: [0, -0.24, -0.02], scale: 0.9, visible: [0.88, 2] },
];

export const TALL_FLIGHT: Flight = {
  cameraCurve: toCurve(TALL_CAMERA_KEYS),
  targetCurve: toCurve(TALL_TARGET_KEYS),
  slots: TALL_SLOTS,
  /* Wide-angle, because a tall frame seen through a long lens is a
     letterbox stood on end: at 38 degrees the shaft has no walls to speak
     of and the push into a pack reads as a zoom instead of as approach. */
  fov: 60,
};

/**
 * Accent colour of the travelling key light, keyed to progress. It carries
 * the mood from turmeric through each product's own accent and out into the
 * green of the promise. Shared: the beats are the same beats either way.
 */
export const LIGHT_KEYS: { at: number; color: string }[] = [
  { at: 0, color: "#f5b301" },
  { at: 0.33, color: "#f2860d" },
  { at: 0.5, color: "#e63324" },
  { at: 0.67, color: "#f2860d" },
  { at: 0.85, color: "#f5b301" },
  { at: 1, color: "#009b4c" },
];
