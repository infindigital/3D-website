/**
 * Content for the Chicken 65 chapter of the 3 in 1 Masala page.
 *
 * Every line is transcribed from what the owner supplied with the pack: the
 * bullet-point brief, the preparation panel printed on the back, the two
 * plated comparison shots and the ten-second film. Nothing is invented. The
 * one number that is worked out rather than quoted is the sachet yield, and
 * it comes from the pack itself. The weights of chicken each size prepares are
 * deliberately absent — the owner asked for them off this page.
 *
 * It sits beside config/gobi.ts rather than inside config/products.ts for the
 * same reason: the catalogue stays the two-line summary the rest of the site
 * reads, and the long-form copy belongs to the one page that shows it.
 */

import type { PackSize } from "./gobi";

/** Everything this chapter loads, all under public/assets/products/three-in-one. */
export const c65Assets = {
  /**
   * The two plates the owner shot for the comparison sheet, kept on their
   * studio white and squared up. The white comes off in CSS with a circular
   * mask rather than a cut-out: the plate is white and the backdrop is white,
   * so no cut-out can tell the two apart without eating the rim, but both
   * plates are round and centred, which the shape can be relied on.
   */
  plates: {
    ours: "/assets/products/three-in-one/c65-plate-ours.webp",
    other: "/assets/products/three-in-one/c65-plate-other.webp",
  },
  /** The range shot, one dish at a time */
  dishes: {
    chicken: "/assets/products/three-in-one/dish-chicken-65.webp",
    kabab: "/assets/products/three-in-one/dish-kabab.webp",
    fish: "/assets/products/three-in-one/dish-fish-fry.webp",
    gobi: "/assets/products/three-in-one/dish-gobi-65.webp",
  },
  /** The three plates the one pack makes, shot together */
  spread: "/assets/products/three-in-one/c65-spread.webp",
  film: "/assets/products/three-in-one/c65-film.mp4",
  filmPoster: "/assets/products/three-in-one/c65-film-poster.webp",
} as const;

/**
 * What one sachet is for. Deliberately no weight of chicken: the owner asked
 * for the "how many grams of chicken" figures off this page, so the sachet is
 * described by what it cooks, not by what it coats.
 */
export const c65Yield = {
  sachet: "25 g",
  note: "One 25 g sachet is one fry — a plate for four.",
} as const;

/** The short claims that run across the top of the page, under the hero. */
export const c65Promises = [
  "3 in 1 spice blend",
  "Versatile usage",
  "Delicious taste",
  "Hygienically packed",
  "No artificial colours",
  "No preservatives",
] as const;

/** The mark drawn beside a feature. Each is a small inline SVG, never a photo
    of type — the pack's own panel is a picture, and a picture of a word cannot
    be read at any size, in any language, or out loud. */
export type C65Mark = "blend" | "versatile" | "taste" | "sealed";

export interface C65Feature {
  id: string;
  mark: C65Mark;
  label: string;
  body: string;
}

/**
 * The four things printed across the front of the pack, in the order they are
 * printed. This is the pack introducing itself, so the wording stays the
 * pack's; the half-line under each is what it means in a kitchen, kept to a
 * breath — four cards that each need a sentence read as a paragraph cut into
 * four, not as four points.
 */
export const c65Features: C65Feature[] = [
  {
    id: "blend",
    mark: "blend",
    label: "3-in-1 spice blend",
    body: "Chicken 65, fish fry, gobi manchurian.",
  },
  {
    id: "versatile",
    mark: "versatile",
    label: "Versatile usage",
    body: "Deep fry, pan fry or grill.",
  },
  {
    id: "taste",
    mark: "taste",
    label: "Delicious taste",
    body: "Fry-counter colour and heat, measured in.",
  },
  {
    id: "packed",
    mark: "sealed",
    label: "Hygienically packed",
    body: "Sealed at the mill, dry until opened.",
  },
];

export interface C65Step {
  id: string;
  /** The clock the step keeps, or the thing it needs */
  cue: string;
  title: string;
  body: string;
}

/**
 * The preparation panel on the back of the pack, step for step. The panel is
 * written for chicken, fish and gobi together; this chapter is the chicken
 * reading of it, and the pieces are the only thing that changes.
 */
export const c65Steps: C65Step[] = [
  {
    id: "mix",
    cue: "1 sachet",
    title: "Mix the paste",
    body: "Masala with egg, water or curd, and ginger-garlic paste. Thick enough to cling to a spoon.",
  },
  {
    id: "coat",
    cue: "30 minutes",
    title: "Coat and leave it",
    body: "Work the paste over the chicken until every piece is covered, then let it marinate.",
  },
  {
    id: "fry",
    cue: "Moderate flame",
    title: "Fry, and serve hot",
    body: "Deep fry on a moderate flame until the coat sets and colours. Straight off the oil onto the plate.",
  },
];

export interface C65Advantage {
  id: string;
  /** One line, ticked. Long enough to be a claim, short enough to be a bullet. */
  text: string;
}

/**
 * What keeping one of these in the drawer actually saves you — the owner's own
 * listing bullets, each cut to the one thing it says. They are bullets on the
 * pack's listing and they stay bullets here: a sentence of explanation under
 * each turns six quick reasons into six paragraphs nobody finishes.
 */
export const c65Advantages: C65Advantage[] = [
  { id: "jars", text: "One pack instead of eight jars" },
  { id: "range", text: "Chicken 65, fish fry, kabab, gobi" },
  { id: "quick", text: "Mix, coat, fry — minutes, not hours" },
  { id: "same", text: "The same plate every single time" },
  { id: "clean", text: "No artificial colours or preservatives" },
  { id: "sealed", text: "Sealed pouch, fresh to the last spoon" },
];

export interface C65Point {
  /** What the two plates are being read for */
  feature: string;
  ours: string;
  theirs: string;
}

/**
 * The owner's comparison sheet, which puts the two plates side by side and
 * ticks three things off against them. The sheet's own wording is the feature;
 * what each plate shows is the pair of lines under it.
 */
export const c65Points: C65Point[] = [
  {
    feature: "Best quality ingredients",
    ours: "An even red right through the coat, from the spice rather than from a colouring.",
    theirs: "Patchy brown, scorched at the edges and pale in the middle.",
  },
  {
    feature: "Easy-to-use mix",
    ours: "One sachet is the whole seasoning. Mix, coat, fry.",
    theirs: "A base powder that still needs chilli, salt and the rest measured in.",
  },
  {
    feature: "Traditional masala mix",
    ours: "Curry leaf, green chilli and onion, the way a fry counter sends it out.",
    theirs: "Dry, with a chutney on the side to make up for it.",
  },
];

export interface C65Dish {
  id: keyof typeof c65Assets.dishes;
  name: string;
  note: string;
}

/**
 * The four ways the pack is sold, smallest first. `scale` is only how tall the
 * card stands on the shelf, so the range reads as a range before a word of it
 * is read.
 *
 * No pack quotes how much chicken it prepares: the owner asked for those
 * figures off this page, and a card here is for choosing a size, not for
 * working out a marinade. Nothing replaces them — the row is simply shorter.
 *
 * The shape is the one the shelf already speaks, imported rather than copied:
 * two products describing their sizes two different ways would be two
 * components to keep in step instead of one.
 */
export const c65Packs: PackSize[] = [
  {
    id: "25g",
    size: "25 g",
    who: "One sachet per fry",
    scale: 0.7,
    order: "Hi, I would like to order RS Chef'z 3 in 1 Masala – 25 g.",
    // amazonUrl: "PASTE_THIS_SIZE'S_OWN_AMAZON_URL_HERE",
  },
  {
    id: "500g",
    size: "500 g",
    who: "The everyday kitchen pouch",
    scale: 0.86,
    order: "Hi, I would like to order RS Chef'z 3 in 1 Masala – 500 g.",
    // amazonUrl: "PASTE_THIS_SIZE'S_OWN_AMAZON_URL_HERE",
  },
  {
    id: "1kg",
    size: "1 kg",
    who: "Big families and small caterers",
    scale: 1,
    order: "Hi, I would like to order RS Chef'z 3 in 1 Masala – 1 kg.",
    // amazonUrl: "PASTE_THIS_SIZE'S_OWN_AMAZON_URL_HERE",
  },
  {
    id: "5kg",
    size: "5 kg",
    who: "Restaurant and canteen kitchens",
    scale: 1.18,
    order: "Hi, I would like to order RS Chef'z 3 in 1 Masala – 5 kg.",
    // amazonUrl: "PASTE_THIS_SIZE'S_OWN_AMAZON_URL_HERE",
  },
];

/** The four dishes in the range shot — the same pack, four dinners. */
export const c65Range: C65Dish[] = [
  { id: "chicken", name: "Chicken 65", note: "The one this chapter is about." },
  { id: "kabab", name: "Seekh Kabab", note: "Same marinade, shaped on a skewer." },
  { id: "fish", name: "Fish Fry", note: "Coated thin, fried hard, served with lime." },
  { id: "gobi", name: "Gobi 65", note: "For the table that does not eat chicken." },
];
