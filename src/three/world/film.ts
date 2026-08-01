/**
 * The kitchen film, cut into the world.
 *
 * One ten-second film was shot with the real packets: the gobi toss, the
 * chef opening the 3 in 1 sachet, masala going onto the chicken, the fry,
 * the gobi pack beside its finished plate, and both packs together. Those
 * are, in order, exactly the six beats this page already tells.
 *
 * So the film is not laid over the page as a background. Each beat owns the
 * stretch of it that belongs to that beat, and that stretch plays, on a
 * screen standing in the world at that point of the flight. Scroll chooses
 * which shot is running; the shot itself keeps moving at its own speed,
 * because a cooking film scrubbed by a scroll wheel is a slideshow.
 *
 * There is one video element and one texture behind all six screens. Only
 * one screen is ever near full strength, so the single decoder is always
 * showing the shot the screen in front of you is asking for.
 */

export const FILM_SRC = "/assets/home/kitchen-film.mp4";
export const FILM_POSTER = "/assets/home/kitchen-film-poster.webp";

/** The film's own shape, so a screen's height never has to be guessed */
export const FILM_ASPECT = 1280 / 720;

export interface FilmScreen {
  id: string;
  /** The stretch of film this beat owns, in seconds */
  segment: [number, number];
  /** Where in world progress this screen is the one on show */
  band: [number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  /** Width in world units; the height follows FILM_ASPECT */
  width: number;
  /** How solid the film is allowed to get here. Full unless copy sits over
   *  the screen rather than beside it, and even then only eased off. */
  opacity: number;
}

/**
 * Each screen stands behind whatever that beat is really about — behind the
 * two packs at the lineup, behind the single pack at a flavour beat, behind
 * the recipe cards at the ritual — and is angled to face the camera at the
 * moment it matters. The bands touch rather than overlap far, so the cut
 * from one segment to the next always happens under a crossfade.
 *
 * These positions are read against src/three/world/flightPath.ts. Move a
 * camera key and the screen it frames has to move with it.
 *
 * The opacities are high throughout: this is the footage, not a texture
 * behind the footage, and a screen held back to a third of itself reads as
 * a faded print rather than as a film playing in the room. Where copy sits
 * over a screen rather than beside it, the copy carries its own pool of
 * light in HomeWorld.module.css — that is what buys legibility now, rather
 * than dimming the film for everyone.
 */
export const FILM_SCREENS: FilmScreen[] = [
  {
    id: "lineup",
    /* The toss: florets and chilli hanging over the plate */
    segment: [0.15, 2.35],
    band: [-0.14, 0.22],
    position: [0, 0.85, -4.6],
    rotation: [0, 0, 0],
    width: 8.2,
    opacity: 1,
  },
  {
    id: "story",
    /* Masala going onto the chicken: hands, spoon, curry leaves */
    segment: [4.5, 5.5],
    band: [0.21, 0.46],
    position: [0, 0.55, -12.8],
    rotation: [0, 0, 0],
    width: 7.4,
    opacity: 0.86,
  },
  {
    id: "flavour0",
    /* The gobi pack beside the plate it just made */
    segment: [7.45, 8.65],
    band: [0.45, 0.6],
    position: [-0.2, 0.6, -19],
    rotation: [0, -0.26, 0],
    width: 6.4,
    opacity: 1,
  },
  {
    id: "flavour1",
    /* The chef holding the 3 in 1 sachet, then opening it */
    segment: [2.45, 4.45],
    band: [0.6, 0.75],
    position: [0.2, 0.6, -26],
    rotation: [0, 0.26, 0],
    width: 6.4,
    opacity: 1,
  },
  {
    id: "ritual",
    /* Into the oil, and the fry */
    segment: [5.55, 7.4],
    band: [0.75, 0.9],
    position: [0, 0.7, -33.6],
    rotation: [0, 0, 0],
    width: 8,
    opacity: 0.84,
  },
  {
    id: "finale",
    /* Both packs, both plates, on the table */
    segment: [8.75, 9.95],
    band: [0.9, 1.1],
    position: [0, 0.8, -40.6],
    rotation: [0, 0, 0],
    width: 8.6,
    opacity: 1,
  },
];

/**
 * How fast to run a segment.
 *
 * The shots are between one and two seconds each. Played at speed they
 * would loop before the eye has settled on them, so a short segment is
 * slowed until one pass takes around three seconds. Food footage takes
 * kindly to it — the oil bubbles more slowly and the toss hangs longer.
 */
export function segmentRate([start, end]: [number, number]): number {
  const span = Math.max(0.1, end - start);
  return Math.min(1, Math.max(0.45, span / 3));
}
