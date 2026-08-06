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

/** The three things the chapter opens on, taken from the brief. */
export const c65Claims = [
  {
    label: "Restaurant-style",
    body: "The colour and the crunch of a fry counter, from one sachet.",
  },
  {
    label: "No extra spices",
    body: "Chilli, salt and the aromatics are already in the blend.",
  },
  {
    label: "Nothing artificial",
    body: "No artificial colours, no preservatives, no artificial flavour.",
  },
] as const;

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

/** The one variation printed beside the steps, for tikka. */
export const c65Tikka = {
  title: "Or take it off the grill",
  body: "The same marinade, fried in a pan or run over a charcoal oven or gas grill, is tikka.",
} as const;

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

/** The four dishes in the range shot — the same pack, four dinners. */
export const c65Range: C65Dish[] = [
  { id: "chicken", name: "Chicken 65", note: "The one this chapter is about." },
  { id: "kabab", name: "Seekh Kabab", note: "Same marinade, shaped on a skewer." },
  { id: "fish", name: "Fish Fry", note: "Coated thin, fried hard, served with lime." },
  { id: "gobi", name: "Gobi 65", note: "For the table that does not eat chicken." },
];
