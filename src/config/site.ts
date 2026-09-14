/**
 * Central site configuration.
 * Secrets and per-environment values come from environment variables,
 * documented in docs/ENVIRONMENT.md. Public constants live here.
 */

export const siteConfig = {
  name: "RS Chef'z",
  tagline: "Authentic Flavour. Crafted to Perfection.",
  description:
    "Bring restaurant-style taste to your kitchen with premium RS Chef'z masalas. Gobi Manchurian Masala and 3 in 1 Masala for Chicken 65, Fish Fry and Gobi Manchurian.",
  /**
   * The brand's Amazon storefront. This is the fallback every pack falls back
   * to; a pack that has its own Amazon listing carries it as `amazonUrl` on
   * the pack itself, see PackSize in config/gobi.ts.
   */
  amazonStoreUrl:
    "https://www.amazon.in/stores/RSChefz/page/55B0C3F8-FE1A-4327-BE19-97F52D44C69D?lp_asin=B0D5CP554F&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
  /**
   * Country code + number, digits only, as wa.me wants it.
   * NEXT_PUBLIC_WHATSAPP_NUMBER overrides this when it is set, so the number
   * can be changed on the host without a deploy.
   */
  whatsappNumber: "918548043650",
  /** The social preview image, 1200x630, served from this origin. */
  ogImage: "/og-image.jpg",
  /**
   * Where the brand sells and where it operates. Both are stated on the
   * packs and on the site, and both are what the structured data asserts.
   */
  country: "India",
  countryCode: "IN",
} as const;

/**
 * Canonical site origin, no trailing slash.
 *
 * Every canonical URL, the sitemap, robots.txt, the Open Graph URLs and every
 * piece of structured data resolve through this one function, so connecting
 * the real domain is a single environment variable and no code change.
 *
 * Order matters. NEXT_PUBLIC_SITE_URL is the production answer; the Vercel-
 * supplied host is the preview answer, so a preview deployment is
 * self-consistent rather than claiming to be production; localhost is last.
 *
 * Tested for emptiness rather than for undefined: a variable created in a
 * host's dashboard but left blank arrives as "", which `??` would accept and
 * hand to `new URL("")` as a crash during the build.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const onVercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (onVercel) return `https://${onVercel}`;

  return "http://localhost:3000";
}

/** An absolute URL for a path, for canonicals and structured data. */
export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Builds the wa.me link for the WhatsApp order buttons.
 *
 * The number falls back to siteConfig.whatsappNumber, so the buttons work on
 * a fresh checkout with no environment set. NEXT_PUBLIC_WHATSAPP_NUMBER still
 * wins where it is set. The return type stays nullable: a deployment that
 * deliberately blanks the variable gets the old behaviour of hiding the
 * button rather than linking to wa.me with no recipient.
 */
export function getWhatsAppUrl(message?: string): string | null {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || siteConfig.whatsappNumber;
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Where an Amazon button goes, most specific destination first.
 *
 * Pass the candidates in that order — typically the pack size's own listing,
 * then the product's store page — and the first one supplied wins. The brand
 * storefront is the last resort, so a button never links nowhere and never
 * guesses a listing it has not been given.
 */
export function getAmazonUrl(...candidates: Array<string | undefined>): string {
  for (const url of candidates) {
    const trimmed = url?.trim();
    if (trimmed) return trimmed;
  }
  return siteConfig.amazonStoreUrl;
}
