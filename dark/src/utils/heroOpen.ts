/**
 * The home page opens on a three-second intro: a sheet of restaurant orange
 * with the kitchen film running inside a small organic shape, which grows
 * until it has taken the room. The navigation bar must not be sitting over
 * that, and it must arrive on the beat the shape lands rather than at a
 * delay somebody guessed.
 *
 * So the hero says when. This lives on its own, away from both of them,
 * because the bar is on every page and the hero is on one — importing the
 * name from the hero would drag the hero's timeline into every other
 * page's bundle to read one string.
 */
export const HERO_OPEN_EVENT = "rschefz:hero-open";

/**
 * How long the bar will wait for that event before coming down anyway. A
 * hero that fails to mount, or a bundle that never arrives, must not be
 * able to strand the navigation off screen.
 */
export const HERO_OPEN_FALLBACK_MS = 4200;

/**
 * The brand has landed in the bar.
 *
 * The intro opens with the logo standing in the middle of the film, the way
 * the reference hero does, and flies it into the navigation as the orange
 * leaves. Two copies of the same mark on screen at once would give the trick
 * away, so the bar holds its own until the flying one is standing on it.
 */
export const HERO_BRAND_EVENT = "rschefz:hero-brand-landed";

/**
 * How long the bar will hold its mark before showing it anyway. Longer than
 * the flight, and for the same reason as the one above: nothing the hero
 * does may be able to leave the site without its own name on it.
 */
export const HERO_BRAND_FALLBACK_MS = 5200;
