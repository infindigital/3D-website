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
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
