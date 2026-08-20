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
  amazonStoreUrl:
    "https://www.amazon.in/stores/RSChefz/page/55B0C3F8-FE1A-4327-BE19-97F52D44C69D?lp_asin=B0D5CP554F&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
} as const;

/**
 * Canonical site origin, no trailing slash.
 *
 * The value is treated as missing when it is blank, not merely when it is
 * undefined. Vercel's import wizard offers to create every variable it
 * finds in .env.example, and a variable left unfilled is created as an
 * empty string rather than not created at all — so `??` alone hands an
 * empty string to `new URL()` in the root layout, which throws
 * ERR_INVALID_URL and fails the build rather than the page.
 *
 * With nothing configured, a Vercel deployment names itself: the project's
 * production domain if it has one, otherwise this particular deployment's
 * URL. That is a real origin, which is what metadata needs; the localhost
 * fallback is then only ever reached off-platform.
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
