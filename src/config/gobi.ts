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

export interface GobiRecipe {
  yield: string;
  time: string;
  ingredients: string[];
  steps: RecipeStep[];
  note: string;
}

/** The method printed on the recipe card, as four steps. */
export const gobiRecipe: GobiRecipe = {
  yield: "500 g cauliflower",
  time: "30 min rest, 15 min cook",
  /** Everything the sauce needs; the coating needs only the masala and water. */
  ingredients: [
    "500 g cauliflower",
    "1 tbsp ginger garlic paste",
    "1 tbsp soy sauce",
    "2 tbsp tomato sauce",
    "2 tbsp hot & sweet tomato sauce",
    "1 tbsp corn sauce",
    "2 spring onions",
    "Chopped onion & green chilli",
  ],
  steps: [
    {
      title: "Mix the masala",
      body: "Work 50 g of masala into a smooth paste with a little water or curd and the ginger-garlic paste.",
    },
    {
      title: "Coat and rest",
      body: "Cut the cauliflower into bite-sized pieces, wash and drain, then turn them through the paste and leave for 30 minutes.",
    },
    {
      title: "Fry till golden",
      body: "Deep fry on a moderate flame until the coating turns golden. A pan, an air fryer or a charcoal grill on low heat does the same job.",
    },
    {
      title: "Finish in the sauce",
      body: "Sauté onion, green chilli and ginger-garlic with the soy, tomato, hot-and-sweet and corn sauces, fold the fried gobi through, and garnish with spring onion.",
    },
  ],
  /** The line the pack prints in brackets, and the one people most often miss. */
  note: "Do not add chilli or salt — the masala already carries both.",
};

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
