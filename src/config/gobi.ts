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

/**
 * The product features from the owner's bullet-point brief.
 *
 * Four, not the five the brief lists: what to serve it as is a caption on the
 * photograph of it being served, and saying it twice cost a whole card. Half a
 * line each — a card that takes three lines to make one point is a card nobody
 * finishes, and four of them read at a glance where five did not.
 */
export const gobiFeatures: GobiFeature[] = [
  {
    title: "One mix, every vegetable",
    body: "Cauliflower, paneer, mushroom or potato.",
  },
  {
    title: "A coating that stays crisp",
    body: "Deep fryer, air fryer or a pan.",
  },
  {
    title: "No second shelf of spices",
    body: "No salt, no flour, no long list.",
  },
  {
    title: "Clean all the way through",
    body: "No artificial colours or preservatives.",
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
  /** The two stretches of the three quarters of an hour, drawn to scale */
  timeline: RecipeSpan[];
  ingredients: string[];
  steps: RecipeStep[];
  moves: PrepMove[];
  note: string;
}

/**
 * The recipe card. The ingredient list is the owner's own list in the owner's
 * own order, and the steps are the paragraphs printed under METHOD, cut down
 * to the instructions themselves: every ingredient, quantity, temperature and
 * order of work the card gives is still here, and only the words around them
 * are gone. Someone cooking from a screen is reading with their hands full.
 */
export const gobiRecipe: GobiRecipe = {
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
  /*
   * One sentence each. The card's paragraphs said the same things at three
   * times the length, and four paragraphs beside a film and a chart is what
   * made the section unreadable — the sauces are named in the list above, so
   * the step does not have to name them again.
   */
  steps: [
    {
      title: "Cut, marinate, fry",
      body: "Bite-sized, washed, drained. Marinate in 50 g masala and a little water, then fry till golden.",
    },
    {
      title: "Build the sauce",
      body: "Sauté the onion, green chilli and ginger-garlic paste, then the four sauces.",
    },
    {
      title: "Fold the gobi through",
      body: "Add the fried gobi and sauté.",
    },
    {
      title: "Garnish and serve",
      body: "Off the flame, spring onion over. Serve hot.",
    },
  ],
  /**
   * The four pictures that run along the foot of the card. They are the same
   * method told without a pan in front of you, so they only carry what the
   * steps above them do not — the curd, and the grill. A few words each: the
   * drawing is the instruction, and a caption that repeats it is a caption
   * that turns four pictures back into four paragraphs.
   */
  moves: [
    { id: "mix", label: "Mix", body: "Masala with curd or water." },
    { id: "coat", label: "Coat", body: "Gobi, mushroom or paneer." },
    { id: "fry", label: "Fry", body: "Deep fry, moderate flame." },
    { id: "grill", label: "Or grill", body: "Pan, charcoal or gas, on low." },
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
    body: "Corn starch, set hard by the hot oil.",
    r: 86,
    tone: "#e2952f",
  },
  {
    name: "Masala and water",
    body: "A thin paste, so the seasoning goes right through.",
    r: 62,
    tone: "#c8461f",
  },
  {
    name: "The gobi",
    body: "Bite-sized, washed, drained.",
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

/**
 * The three plating ideas from the owner's serving sheet, in that order. One
 * of the three is on screen at a time beside its photograph, and the
 * photograph is doing most of the describing.
 */
export const gobiServings: ServingIdea[] = [
  {
    id: "dry",
    index: "01",
    name: "Dry Gobi Manchurian",
    style: "Appetiser",
    image: gobiAssets.platters.dry,
    presentation:
      "On skewers standing in a glass, or flat on a platter — street food, plated.",
    garnish: "Spring onion, cilantro, sesame.",
    dip: "Schezwan or sweet chilli.",
  },
  {
    id: "semi",
    index: "02",
    name: "Semi-Gravy Gobi Manchurian",
    style: "Side dish",
    image: gobiAssets.platters.semi,
    presentation:
      "Spooned over fried rice or noodles, peppers and onions layered through.",
    garnish: "Cilantro and spring onion.",
    dip: "Mild chilli-garlic, or soy.",
  },
  {
    id: "gravy",
    index: "03",
    name: "Gravy Gobi Manchurian",
    style: "Main course",
    image: gobiAssets.platters.gravy,
    presentation: "Gravy-rich in deep bowls, as the main rather than the starter.",
    garnish: "Green onion and a drizzle of sesame oil.",
    dip: "Light soy or chilli-garlic, if any.",
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
    who: "One sachet per fry",
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
