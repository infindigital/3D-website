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
  /* Held for whatever needs the registered entity later — an invoice, a
     policy page, a schema.org block. Nothing on the site shows it: every
     page signs off as RS Chef'z. */
  company: "SS Food Products",
  location: "Mangaluru, Karnataka, India",
  amazonStoreUrl:
    "https://www.amazon.in/stores/RSChefz/page/55B0C3F8-FE1A-4327-BE19-97F52D44C69D?lp_asin=B0D5CP554F&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
} as const;

/** Canonical site origin, no trailing slash. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Builds the wa.me link for Buy on WhatsApp buttons.
 * Returns null when NEXT_PUBLIC_WHATSAPP_NUMBER is not configured so the UI
 * can hide or disable the button instead of linking nowhere.
 */
export function getWhatsAppUrl(message?: string): string | null {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
