/**
 * Content for the Chicken 65 chapter of the 3 in 1 Masala page.
 *
 * Every line is transcribed from what the owner supplied with the pack: the
 * bullet-point brief, the preparation panel printed on the back, the two
 * plated comparison shots and the ten-second film. Nothing is invented. The
 * one number that is worked out rather than quoted is the sachet yield, and
 * it comes from the ratio printed on the pack — 500 g of masala to 7.5 kg of
 * cleaned meat, so one 25 g sachet to 375 g.
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
  /** The same masala off the grill rather than out of the pan */
  tikka: "/assets/products/three-in-one/c65-tikka.webp",
  film: "/assets/products/three-in-one/c65-film.mp4",
  filmPoster: "/assets/products/three-in-one/c65-film-poster.webp",
} as const;

/** One 25 g sachet against the ratio printed on the pack. */
export const c65Yield = {
  sachet: "25g",
  chicken: "375g",
  note: "One 25 g sachet coats 375 g of cleaned chicken — a plate for four.",
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
 * pack's; the half-line under each is what it means in a kitchen.
 */
export const c65Features: C65Feature[] = [
  {
    id: "blend",
    mark: "blend",
    label: "3-in-1 spice blend",
    body: "Chicken 65, fish fry and gobi manchurian out of the one sachet.",
  },
  {
    id: "versatile",
    mark: "versatile",
    label: "Versatile usage",
    body: "Deep fry it, pan fry it or run it over a grill for tikka.",
  },
  {
    id: "taste",
    mark: "taste",
    label: "Delicious taste",
    body: "The colour and the heat of a fry counter, already measured out.",
  },
  {
    id: "packed",
    mark: "sealed",
    label: "Hygienically packed",
    body: "Sealed at the mill and flat on the shelf, dry until you open it.",
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
  /** 01, 02 … drawn large on the face of the card */
  index: string;
  title: string;
  body: string;
}

/**
 * What keeping one of these in the drawer actually saves you. Every line is
 * the pack's own claim read from the cook's side of it rather than the
 * label's — the blend list becomes eight jars you do not buy, the printed
 * ratio becomes half an hour you do not stand over.
 */
export const c65Advantages: C65Advantage[] = [
  {
    id: "one",
    index: "01",
    title: "One pack instead of eight jars",
    body: "Chilli, salt, turmeric, ginger and the rest are weighed in already. Nothing to measure and nothing else to open.",
  },
  {
    id: "three",
    index: "02",
    title: "Three dishes off one shelf",
    body: "Chicken 65, fish fry and gobi manchurian — and kabab and tikka off the same marinade.",
  },
  {
    id: "same",
    index: "03",
    title: "The same plate every time",
    body: "The blend is mixed at the mill, so the tenth fry of the month tastes like the first.",
  },
  {
    id: "clean",
    index: "04",
    title: "Nothing artificial in it",
    body: "No artificial colours, no preservatives and no artificial flavour — the colour is the chilli.",
  },
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
 * The four ways the pack is sold, smallest first. The yields are worked out
 * from the ratio printed on the pack — 500 g of masala to 7.5 kg of cleaned
 * meat, so 1 g to 15 g — and not quoted from anywhere else. `scale` is only
 * how tall the card stands on the shelf, so the range reads as a range before
 * a word of it is read.
 *
 * The shape is the one the shelf already speaks, imported rather than copied:
 * two products describing their sizes two different ways would be two
 * components to keep in step instead of one.
 */
export const c65Packs: PackSize[] = [
  {
    id: "25g-10",
    size: "25 g",
    unit: "Pack of 10",
    who: "A sachet a fry, ten fries in",
    yields: "About 375 g of chicken per sachet",
    scale: 0.7,
    order:
      "Hi RS Chef'z, I would like to order 3 in 1 Masala — 25 g, pack of 10.",
  },
  {
    id: "30g-6",
    size: "30 g",
    unit: "Pack of 6",
    who: "The slightly bigger sachet",
    yields: "About 450 g of chicken per sachet",
    scale: 0.8,
    order:
      "Hi RS Chef'z, I would like to order 3 in 1 Masala — 30 g, pack of 6.",
  },
  {
    id: "500g-1",
    size: "500 g",
    unit: "Pack of 1",
    who: "The everyday kitchen pouch",
    yields: "About 7.5 kg of chicken",
    scale: 1,
    order:
      "Hi RS Chef'z, I would like to order 3 in 1 Masala — 500 g, pack of 1.",
  },
  {
    id: "500g-2",
    size: "500 g",
    unit: "Pack of 2",
    who: "Big families and small caterers",
    yields: "About 15 kg of chicken",
    scale: 1.16,
    order:
      "Hi RS Chef'z, I would like to order 3 in 1 Masala — 500 g, pack of 2.",
  },
];

/** The four dishes in the range shot — the same pack, four dinners. */
export const c65Range: C65Dish[] = [
  { id: "chicken", name: "Chicken 65", note: "The one this chapter is about." },
  { id: "kabab", name: "Seekh Kabab", note: "Same marinade, shaped on a skewer." },
  { id: "fish", name: "Fish Fry", note: "Coated thin, fried hard, served with lime." },
  { id: "gobi", name: "Gobi 65", note: "For the table that does not eat chicken." },
];
