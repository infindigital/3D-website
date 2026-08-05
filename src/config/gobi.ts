/**
 * Content for the Gobi Manchurian Masala page.
 *
 * Every line here is transcribed from material the brand owner supplied with
 * the product: the bullet-point brief, the recipe card, the serving-and-plating
 * sheet and the pack itself. Nothing is invented, and the yields below are
 * worked out from the one ratio printed on the pack — 50 g of masala to 700 g
 * of cleaned gobi — rather than quoted from anywhere else.
 *
 * It lives apart from the shared catalogue in config/products.ts because it
 * belongs to this one page. The catalogue stays the two-line summary every
 * other surface of the site reads.
 */

/** The image files this page needs, all under public/assets/products/gobi-manchurian. */
export const gobiAssets = {
  /** The three dishes, cut off their studio backdrop */
  platters: {
    dry: "/assets/products/gobi-manchurian/platter-dry.webp",
    semi: "/assets/products/gobi-manchurian/platter-semi.webp",
    gravy: "/assets/products/gobi-manchurian/platter-gravy.webp",
  },
  /** The full spread, used as a single wide picture rather than a tile */
  spread: "/assets/products/gobi-manchurian/spread.webp",
  film: "/assets/products/gobi-manchurian/recipe.mp4",
  filmPoster: "/assets/products/gobi-manchurian/recipe-poster.webp",
  /** The card's own four drawings, lifted off their grey tile */
  moves: {
    mix: "/assets/products/gobi-manchurian/move-mix.webp",
    coat: "/assets/products/gobi-manchurian/move-coat.webp",
    fry: "/assets/products/gobi-manchurian/move-fry.webp",
    grill: "/assets/products/gobi-manchurian/move-grill.webp",
  },
} as const;

/**
 * The six things in the blend, photographed and cut off their studio white.
 * Keyed by the same id the blend list uses so the two cannot drift apart.
 */
export const gobiIngredientImages = {
  chilli: "/assets/products/gobi-manchurian/ing-chilli.webp",
  turmeric: "/assets/products/gobi-manchurian/ing-turmeric.webp",
  cornstarch: "/assets/products/gobi-manchurian/ing-cornstarch.webp",
  ginger: "/assets/products/gobi-manchurian/ing-ginger.webp",
  salt: "/assets/products/gobi-manchurian/ing-salt.webp",
  spices: "/assets/products/gobi-manchurian/ing-spices.webp",
} as const;

/** The short claims that run across the top of the page. */
export const gobiPromises = [
  "No artificial colours",
  "No preservatives",
  "Restaurant-style crunch",
  "Deep fry, air fry or pan fry",
  "Ready in minutes",
  "Gobi, paneer, mushroom, potato",
] as const;

export interface GobiFeature {
  title: string;
  body: string;
}

/** The five product features from the owner's bullet-point brief. */
export const gobiFeatures: GobiFeature[] = [
  {
    title: "One mix, every vegetable",
    body: "Blended to bring restaurant-style flavour to cauliflower, paneer, mushroom and potato alike.",
  },
  {
    title: "A coating that stays crisp",
    body: "Golden and extra-crunchy every time, whether it goes into a deep fryer, an air fryer or a pan.",
  },
  {
    title: "No second shelf of spices",
    body: "No extra salt, no flour, no long list. Mix with a splash of water, coat, and cook.",
  },
  {
    title: "Clean all the way through",
    body: "Zero artificial colours and zero preservatives — high-quality, authentic spices and nothing else.",
  },
  {
    title: "Snack, starter or side",
    body: "An evening snack, a party appetiser, a lunchbox filler or a crisp side for a daily meal.",
  },
];

export interface RecipeStep {
  title: string;
  body: string;
}

export interface PrepMove {
  /** Which of the four illustrations on the card this is */
  id: string;
  label: string;
  body: string;
}

/** One stretch of the cook's time, either theirs or the marinade's */
export interface RecipeSpan {
  minutes: number;
  label: string;
  /** `wait` is time the cook is not in the kitchen for */
  kind: "wait" | "work";
}

export interface GobiRecipe {
  yield: string;
  time: string;
  /** The same two numbers `time` prints, kept apart so they can be drawn to scale */
  timeline: RecipeSpan[];
  ingredients: string[];
  steps: RecipeStep[];
  moves: PrepMove[];
  note: string;
}

/**
 * The recipe card, transcribed. The ingredient list is the owner's own list in
 * the owner's own order, and the three steps are the three paragraphs printed
 * under METHOD — split at their own full stops, not rewritten.
 */
export const gobiRecipe: GobiRecipe = {
  yield: "500 g cauliflower",
  time: "30 min marinade, 15 min cook",
  timeline: [
    { minutes: 30, label: "Marinating", kind: "wait" },
    { minutes: 15, label: "At the pan", kind: "work" },
  ],
  ingredients: [
    "500 g cauliflower",
    "1 tbsp ginger garlic paste",
    "1 tbsp soy sauce",
    "2 tbsp tomato sauce",
    "2 tbsp hot and sweet tomato sauce",
    "1 tbsp corn sauce",
    "2 spring onions",
    "Chopped onion and green chilli",
  ],
  steps: [
    {
      title: "Cut, marinate, fry",
      body: "Cut the cauliflower into bite-sized pieces, and clean and wash it. Marinate with a paste made of 50 g of gobi masala powder and a little water. Fry the marinated gobi in hot oil till golden.",
    },
    {
      title: "Build the sauce",
      body: "In a pan, heat oil and sauté the chopped onion, green chilli, ginger-garlic paste, soy sauce, tomato sauce, hot and sweet tomato sauce, and corn sauce for a few minutes.",
    },
    {
      title: "Fold the gobi through",
      body: "Now add the fried gobi to this sauce and sauté it.",
    },
    {
      title: "Garnish and serve",
      body: "Remove from the flame and garnish with chopped spring onion. Now it's ready to serve.",
    },
  ],
  /**
   * The four pictures that run along the foot of the card. They are the same
   * method told without a pan in front of you — which is why they carry the
   * curd, the 30 minutes and the three ways to cook that the paragraphs skip.
   */
  moves: [
    {
      id: "mix",
      label: "Mix",
      body: "Take masala with curd or water and ginger garlic paste, and mix well.",
    },
    {
      id: "coat",
      label: "Coat",
      body: "Apply this paste to gobi, mushroom or paneer pieces and marinate for 30 minutes.",
    },
    {
      id: "fry",
      label: "Fry",
      body: "Deep fry on a moderate flame. Serve hot.",
    },
    {
      id: "grill",
      label: "Or grill",
      body: "Fry in a pan, or use a charcoal oven or a gas grill on low heat.",
    },
  ],
  /** The line the card prints in brackets, and the one people most often miss. */
  note: "Do not add chilli or salt — the masala already carries both.",
};

export interface CrustLayer {
  name: string;
  body: string;
  /** Radius on the 220-unit cross-section, and the colour of that layer */
  r: number;
  tone: string;
}

/**
 * The coating, read from the outside in. It is the claim the section makes —
 * that the crust is a recipe rather than a knack — so it is drawn rather than
 * asserted, and every layer here is one the pack's own method produces.
 */
export const gobiCrust: CrustLayer[] = [
  {
    name: "Golden crust",
    body: "Corn starch in the mix sets hard the moment it meets hot oil.",
    r: 86,
    tone: "#e2952f",
  },
  {
    name: "Masala and water",
    body: "A thin paste, so the seasoning goes right through instead of sitting on top.",
    r: 62,
    tone: "#c8461f",
  },
  {
    name: "The gobi",
    body: "Bite-sized, washed, drained — dry enough for the paste to hold.",
    r: 40,
    tone: "#f2e7cc",
  },
];

export interface ComparisonRow {
  feature: string;
  /** What this masala does */
  ours: string;
  /** What the owner's sheet says an ordinary local masala does */
  theirs: string;
}

/**
 * The owner's comparison sheet, kept row for row. It is the only place on the
 * page where the product is set against anything else, so it stays factual and
 * short rather than becoming a sales table.
 */
export const gobiComparison: ComparisonRow[] = [
  {
    feature: "Flavour profile",
    ours: "Bold, authentic Indo-Chinese",
    theirs: "Bland or overpowering",
  },
  {
    feature: "Taste consistency",
    ours: "Same great taste every time",
    theirs: "Inconsistent flavour",
  },
  {
    feature: "Spice balance",
    ours: "Perfectly balanced",
    theirs: "Too spicy or too flat",
  },
  { feature: "Aroma", ours: "Fresh and inviting", theirs: "Artificial or weak" },
  {
    feature: "Versatility",
    ours: "Gobi gravy, Manchurian, tikka",
    theirs: "Limited use",
  },
  {
    feature: "Ingredients",
    ours: "Real garlic, ginger, spices",
    theirs: "Synthetic additives",
  },
];

export interface BlendPart {
  /** Keys the photograph in gobiIngredientImages */
  id: keyof typeof gobiIngredientImages;
  name: string;
  /** What it is doing in the blend */
  role: string;
  /** The colour it contributes, used for the light behind its photograph */
  tone: string;
}

/**
 * What is in the pack, in the order the owner's ingredients sheet reads them
 * off. The tones are taken from the spices themselves and are what the section
 * is lit with — there is no artificial colour in the blend or on the page.
 */
export const gobiBlend: BlendPart[] = [
  {
    id: "chilli",
    name: "Chilli",
    role: "The heat, and all of the red",
    tone: "#d02d1c",
  },
  {
    id: "turmeric",
    name: "Turmeric",
    role: "The warm ground note",
    tone: "#e9a41a",
  },
  {
    id: "cornstarch",
    name: "Corn starch",
    role: "What turns the coat crisp",
    tone: "#f3e6cd",
  },
  {
    id: "ginger",
    name: "Ginger",
    role: "The lift behind the heat",
    tone: "#c98a3f",
  },
  { id: "salt", name: "Salt", role: "Already measured in", tone: "#e8eef2" },
  {
    id: "spices",
    name: "Natural spices",
    role: "The rest of the Indo-Chinese",
    tone: "#8c5a2b",
  },
];

/** The pack's own measurements, from the owner's dimension sheet. */
export const gobiPackSpec = {
  width: "11 cm",
  height: "16 cm",
  depth: "2 cm",
  claims: ["Easy to cook", "Ready-mix masala", "Long shelf life"],
} as const;

export interface ServingIdea {
  id: string;
  /** 01, 02, 03 — the number shown on the platter's face */
  index: string;
  name: string;
  style: string;
  image: string;
  /** How the owner's sheet says to plate it */
  presentation: string;
  garnish: string;
  dip: string;
}

/** The three plating ideas from the owner's serving sheet, in that order. */
export const gobiServings: ServingIdea[] = [
  {
    id: "dry",
    index: "01",
    name: "Dry Gobi Manchurian",
    style: "Appetiser",
    image: gobiAssets.platters.dry,
    presentation:
      "Serve the fried cauliflower on skewers upright in a glass, or flat on a platter for a modern street-food look.",
    garnish: "Chopped spring onions, cilantro and sesame seeds.",
    dip: "Schezwan or sweet chilli sauce in small bowls.",
  },
  {
    id: "semi",
    index: "02",
    name: "Semi-Gravy Gobi Manchurian",
    style: "Side dish",
    image: gobiAssets.platters.semi,
    presentation:
      "Spoon it over a bed of fried rice or noodles in a shallow bowl, with bell peppers and onions layered through.",
    garnish: "Fresh cilantro and chopped spring onions.",
    dip: "A mild chilli-garlic sauce or a soy-based dip on the side.",
  },
  {
    id: "gravy",
    index: "03",
    name: "Gravy Gobi Manchurian",
    style: "Main course",
    image: gobiAssets.platters.gravy,
    presentation:
      "Serve it gravy-rich in deep bowls, as the main course rather than the starter.",
    garnish: "Chopped green onions and a drizzle of sesame oil.",
    dip: "A light soy or chilli-garlic dip, if you want one at all.",
  },
];

export interface PackSize {
  id: string;
  /** What is printed on the pack */
  size: string;
  /** The second line, when the pack is a multipack */
  unit?: string;
  who: string;
  /** Worked out from the pack's own 50 g : 700 g ratio */
  yields: string;
  /** Relative height on the shelf, so the four packs read as a range of sizes */
  scale: number;
  /** Message pre-filled into the WhatsApp order for this size */
  order: string;
}

export const gobiPacks: PackSize[] = [
  {
    id: "30g",
    size: "30 g",
    unit: "Pack of 10",
    who: "One sachet per fry, nothing left open",
    yields: "About 400 g of gobi per sachet",
    scale: 0.72,
    order:
      "Hi RS Chef'z, I would like to order Gobi Manchurian Masala — 30 g, pack of 10.",
  },
  {
    id: "500g",
    size: "500 g",
    who: "The everyday kitchen pouch",
    yields: "About 7 kg of gobi",
    scale: 0.86,
    order:
      "Hi RS Chef'z, I would like to order Gobi Manchurian Masala — 500 g.",
  },
  {
    id: "1kg",
    size: "1 kg",
    who: "Big families and small caterers",
    yields: "About 14 kg of gobi",
    scale: 1,
    order: "Hi RS Chef'z, I would like to order Gobi Manchurian Masala — 1 kg.",
  },
  {
    id: "5kg",
    size: "5 kg",
    who: "Restaurant and canteen kitchens",
    yields: "About 70 kg of gobi",
    scale: 1.18,
    order: "Hi RS Chef'z, I would like to order Gobi Manchurian Masala — 5 kg.",
  },
];
