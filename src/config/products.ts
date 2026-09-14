/**
 * Product catalogue. Only two products exist and that is intentional.
 * Package artwork is supplied by the brand owner and stored under
 * public/assets/products. No generated artwork is ever used.
 */

export interface Product {
  /** URL slug, also the folder name under public/assets/products */
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  dishes: string[];
  ingredients: string[];
  usage: string;
  /** Pack-to-food ratio printed on the pack, shown as the big usage stat */
  ratio: {
    masala: string;
    food: string;
  };
  /** Theme accent for this product's scenes and pages */
  accentColor: string;
  images: {
    front: string;
    back: string;
  };
  whatsappMessage: string;
  /**
   * This product's own page in the brand's Amazon store.
   *
   * Every Amazon button on the product's page uses it, and a pack size only
   * overrides it when that size has a listing of its own (PackSize.amazonUrl
   * in config/gobi.ts). Unset, the buttons fall back to the storefront in
   * config/site.ts.
   *
   * Stored as the bare store-page URL. The links these came from carried a
   * `visitId` — a per-session identifier from the browser that copied them —
   * along with `ingress`, `lp_context_asin`, `store_ref` and `ref_`. None of
   * that describes the page, and a session id baked into a site every visitor
   * loads is someone else's stale tracking, so the query string is dropped.
   */
  amazonUrl?: string;
  /**
   * What the search engines are told this page is.
   *
   * Every line below is drawn from the pack, the owner's brief or the recipe
   * card — the same sources the rest of the copy comes from. Nothing here
   * asserts a use the product has not been stated to have, which is why the
   * Gobi pack's block never mentions Gobi 65 or pakoda: its own description
   * covers Manchurian, fry and tikka across gobi, mushroom, paneer and
   * potato, and those two dishes appear nowhere in what the owner supplied.
   * The 3 in 1 pack does list Gobi 65 and kabab, so its block says so.
   */
  seo: {
    /** Unique per page. Primary keyword, a useful modifier, then the brand. */
    title: string;
    metaDescription: string;
    /** The visible line under the H1 */
    subheading: string;
    /** One plain paragraph near the top: what this is, in search-legible words */
    intro: string;
    faqs: { question: string; answer: string }[];
  };
}

export const products: Product[] = [
  {
    slug: "gobi-manchurian-masala",
    name: "Gobi Manchurian Masala",
    shortName: "Gobi Manchurian",
    tagline: "Crispy. Spicy. Restaurant-style flavour in every bite.",
    description:
      "A 3 in 1 masala for Gobi, Mushroom and Paneer. Make Manchurian, Fry or Tikka with one pack. No artificial colors, no preservatives, no artificial flavor.",
    dishes: ["Gobi Manchurian", "Mushroom Fry", "Paneer Tikka"],
    ingredients: [
      "Chilli",
      "Corn Starch",
      "Salt",
      "Turmeric",
      "Ginger",
      "Natural Spices",
    ],
    usage: "50g masala for 700g of cleaned Gobi, Paneer or Mushroom.",
    ratio: { masala: "50g", food: "700g" },
    accentColor: "#E63324",
    images: {
      front: "/assets/products/gobi-manchurian/front.webp",
      back: "/assets/products/gobi-manchurian/back.webp",
    },
    whatsappMessage:
      "Hi RS Chef'z, I would like to order Gobi Manchurian Masala.",
    amazonUrl:
      "https://www.amazon.in/stores/page/744ABF19-B5CA-4539-89D3-93F91114C191",
    seo: {
      title: "Gobi Manchurian Masala | Ready-Mix Spice Blend | RS Chef'z",
      metaDescription:
        "RS Chef'z Gobi Manchurian Masala is a ready-mix spice blend for crispy Gobi Manchurian, gobi fry and tikka. Also for mushroom, paneer and potato. Order across India on Amazon or WhatsApp.",
      subheading:
        "Manchurian, fry or tikka — from one ready-mix pack, with no salt or chilli to add",
      intro:
        "RS Chef'z Gobi Manchurian Masala is a ready-mix spice blend for making restaurant-style Gobi Manchurian at home. Chilli, corn starch, salt, turmeric, ginger and natural spices are already measured into the pack, so there is no second masala to open and no salt or chilli to add. The same blend makes gobi fry and tikka, and works on mushroom, paneer and potato as well as cauliflower. It is sold in four sizes and can be ordered across India through Amazon or on WhatsApp.",
      faqs: [
        {
          question: "What is Gobi Manchurian Masala?",
          answer:
            "It is a ready-mix Indo-Chinese spice blend for Gobi Manchurian. The pack contains chilli, corn starch, salt, turmeric, ginger and natural spices, already balanced, so one pack is the whole seasoning for the dish.",
        },
        {
          question: "How do I use RS Chef'z Gobi Manchurian Masala?",
          answer:
            "Cut the cauliflower into bite-sized florets, wash and drain them. Marinate in the masala with a little water or curd, then fry until golden. Build the sauce separately with onion, green chilli and ginger-garlic paste, fold the fried gobi through it, and finish with spring onion.",
        },
        {
          question: "How much masala should I use?",
          answer:
            "The ratio printed on the pack is 50 g of masala for 700 g of cleaned gobi, paneer or mushroom.",
        },
        {
          question: "Do I need to add salt or chilli powder?",
          answer:
            "No. The masala already carries both, so adding more will oversalt the dish.",
        },
        {
          question: "What else can I cook with it besides cauliflower?",
          answer:
            "The same pack works for mushroom, paneer and potato, and makes fry and tikka as well as Manchurian.",
        },
        {
          question: "Can I air fry or pan fry instead of deep frying?",
          answer:
            "Yes. The coating is made to hold up in a deep fryer, an air fryer or a pan.",
        },
        {
          question: "What pack sizes are available?",
          answer:
            "Four: a 30 g sachet in a pack of 10, a 500 g pouch, 1 kg and 5 kg.",
        },
        {
          question: "Where can I buy Gobi Manchurian Masala online in India?",
          answer:
            "RS Chef'z Gobi Manchurian Masala is available across India. You can buy it on Amazon, or order any pack size directly on WhatsApp using the buttons on this page.",
        },
      ],
    },
  },
  {
    slug: "three-in-one-masala",
    name: "3 in 1 Masala",
    shortName: "3 in 1",
    tagline: "One masala. Three favourites.",
    description:
      "Perfect for Chicken 65, Fish Fry and Gobi Manchurian. One pack covers Kabab, Manchuri, Fry and Tikka styles. No artificial colors, no preservatives, no artificial flavor.",
    dishes: ["Chicken 65", "Fish Fry", "Gobi Manchurian"],
    ingredients: [
      "Chilli",
      "Corn Starch",
      "Salt",
      "Turmeric",
      "Ginger",
      "Natural Spices",
    ],
    usage: "500g masala for 7.5kg of cleaned Chicken, Fish or Gobi.",
    ratio: { masala: "500g", food: "7.5kg" },
    accentColor: "#F2860D",
    images: {
      front: "/assets/products/three-in-one/front.webp",
      back: "/assets/products/three-in-one/back.webp",
    },
    whatsappMessage: "Hi RS Chef'z, I would like to order 3 in 1 Masala.",
    amazonUrl:
      "https://www.amazon.in/stores/page/F721B0C6-BECC-45D8-9A04-C83F5C545C38",
    seo: {
      title: "3 in 1 Masala | Chicken 65 & Fish Fry Masala | RS Chef'z",
      metaDescription:
        "RS Chef'z 3 in 1 Masala is a ready-mix spice blend for Chicken 65, fish fry and Gobi Manchurian, and it makes kabab and Gobi 65 from the same pack. Order across India on Amazon or WhatsApp.",
      subheading:
        "Chicken 65, fish fry, kabab and gobi — one ready-mix pack instead of a shelf of jars",
      intro:
        "RS Chef'z 3 in 1 Masala is a ready-mix spice blend for Chicken 65, fish fry and Gobi Manchurian. Chilli, corn starch, salt, turmeric, ginger and natural spices come balanced in the pack, so the method is only three things long: mix the paste, coat and leave it, then fry. The same pack also makes seekh kabab and Gobi 65, which is what 3 in 1 means. It is sold in four sizes and can be ordered across India through Amazon or on WhatsApp.",
      faqs: [
        {
          question: "What is RS Chef'z 3 in 1 Masala?",
          answer:
            "It is one ready-mix spice blend that covers three dishes — Chicken 65, fish fry and Gobi Manchurian — from a single pack. It contains chilli, corn starch, salt, turmeric, ginger and natural spices.",
        },
        {
          question: "How do I use 3 in 1 Masala?",
          answer:
            "Mix the masala into a thick paste with egg, water or curd and ginger-garlic paste. Work the paste over the pieces until every one is covered and leave it to marinate for about thirty minutes. Deep fry on a moderate flame until the coating sets and colours, and serve hot.",
        },
        {
          question: "Can I use it for Chicken 65?",
          answer:
            "Yes. Chicken 65 is one of the three dishes the pack is made for, and the preparation panel printed on the back is written for it.",
        },
        {
          question: "Can I use it for fish fry?",
          answer:
            "Yes. Fish fry is one of the three dishes on the pack. The method is the same — mix the paste, coat the fish, marinate and fry.",
        },
        {
          question: "Can I use it for Gobi Manchurian?",
          answer:
            "Yes. Gobi is the third of the three, and the same pack also makes Gobi 65 for a table that does not eat chicken.",
        },
        {
          question: "Can I use it for kabab?",
          answer:
            "Yes. The same marinade shaped on a skewer makes seekh kabab, and the pack covers kabab, manchuri, fry and tikka styles.",
        },
        {
          question: "How long does the marinade need?",
          answer:
            "About thirty minutes. Most of the preparation time is the marinade's rather than yours.",
        },
        {
          question: "What pack sizes are available?",
          answer: "Four: 25 g, 500 g, 1 kg and 5 kg.",
        },
        {
          question: "Where can I buy 3 in 1 Masala online in India?",
          answer:
            "RS Chef'z 3 in 1 Masala is available across India. You can buy it on Amazon, or order any pack size directly on WhatsApp using the buttons on this page.",
        },
      ],
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
