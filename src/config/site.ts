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
} as const;

/** Canonical site origin, no trailing slash. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
 * Where a given pack's Amazon button goes: its own listing when one has been
 * supplied, the brand storefront otherwise. Kept here so no component has to
 * remember the fallback.
 */
export function getAmazonUrl(variantUrl?: string): string {
  return variantUrl?.trim() || siteConfig.amazonStoreUrl;
}
