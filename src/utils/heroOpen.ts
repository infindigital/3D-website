/**
 * The handover between the home page's opening film and the navigation bar.
 *
 * The home page opens on a sheet of restaurant orange with the kitchen film
 * running inside a small organic shape, which grows until it has taken the
 * room. The navigation must not be sitting over that, and it must arrive on
 * the beat the shape lands rather than at a delay somebody guessed.
 *
 * This lives on its own, away from both of them, because the bar is on every
 * page and the hero is on one — importing the name from the hero would drag
 * the hero's timeline into every other page's bundle to read one string.
 *
 *
 * WHY THE BAR IS TOLD TO HOLD RATHER THAN LEFT TO GUESS
 *
 * The bar used to hide itself on the home page and wait, with a plain
 * setTimeout as its way out if the hero never spoke. That is a race between
 * two different clocks, and it is losable:
 *
 *   - the timer runs on wall-clock time and cannot be slowed down;
 *   - the intro runs on animation frames, and GSAP's lag smoothing stretches
 *     a timeline whose frames are arriving late rather than letting it jump.
 *
 * So on a busy phone the intro takes longer in real seconds than it does in
 * timeline seconds, the timer wins, and the bar slides down on top of the
 * orange sheet that has not finished closing. Measured on a six-times
 * throttled phone, the intro's wipe finished at 6.3s and the timer fired at
 * 6.7s — four tenths of a second of margin, on the machine that happened to
 * be measuring. Slower hardware loses it.
 *
 * The cure is to stop guessing. The hero claims the bar before the first
 * paint and then releases it on its own beats, so there is nothing to race:
 *
 *   HERO_HOLD_EVENT   the hero exists, is about to play an intro, and owns
 *                     the bar and the mark until it says otherwise
 *   HERO_OPEN_EVENT   the room is the hero's; the bar may come down
 *   HERO_BRAND_EVENT  the flying mark has landed; the bar may show its own
 *
 * Nothing is on a timer that competes with the animation. The only timers
 * left are the two below, and both answer a hero that is *not running* —
 * which is the one thing the hero cannot announce for itself.
 */

/** The hero has an intro to play and is taking the bar with it. */
export const HERO_HOLD_EVENT = "rschefz:hero-hold";

/** The room is the hero's. The bar may come down. */
export const HERO_OPEN_EVENT = "rschefz:hero-open";

/**
 * The brand has landed in the bar.
 *
 * The intro opens with the logo standing in the middle of the film and flies
 * it into the navigation as the orange leaves. Two copies of the same mark on
 * screen at once would give the trick away, so the bar holds its own until
 * the flying one is standing on it.
 */
export const HERO_BRAND_EVENT = "rschefz:hero-brand-landed";

/**
 * How long the bar waits to hear from a hero at all before deciding there
 * isn't one.
 *
 * This covers the page that has no hero, the bundle that never arrived and
 * the hero that threw on mount. It is deliberately short, because in every
 * one of those cases there is nothing to wait for and the bar should simply
 * be there. A hero that *is* running claims the bar in a layout effect,
 * before the browser has painted, so it always beats this.
 */
export const HERO_CLAIM_MS = 1200;

/**
 * And how long the bar honours a claim before taking itself back.
 *
 * Only armed once a hero has actually claimed the bar, so it is not racing
 * anything: by then the intro is known to be running and this is purely the
 * answer to one dying halfway through. Long enough that it cannot fire on a
 * slow device merely running the intro slowly, which is the failure the old
 * four-second fallback had.
 */
export const HERO_BACKSTOP_MS = 12000;

/*
 * Whether this visit has moved between pages yet.
 *
 * The intro belongs to arriving at the site, not to the home page. Replaying
 * it on every return to "/" takes the bar and the mark away again for four
 * seconds each time somebody clicks HOME — which reads as the logo going
 * missing, because from the visitor's side that is exactly what happens.
 *
 * It is recorded by the navigation rather than by the hero. The navigation
 * is mounted for the life of the page and only ever sees this change when
 * the path really changes, so it cannot be confused by React mounting a
 * component twice in development to check that it can be.
 */
let navigated = false;

export function markNavigated(): void {
  navigated = true;
}

export function hasNavigated(): boolean {
  return navigated;
}
