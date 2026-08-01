/**
 * Hero film and poster frame for "A Feast in Motion", generated on
 * Higgsfield. Package artwork and the brand logo are owner-supplied and
 * never generated.
 *
 * Local files under public/assets/hero always win. Until they are
 * committed (run scripts/fetch-hero-assets.mjs on a machine with CDN
 * access), the same files reach the browser through this site's own
 * origin instead: the film via /api/hero-film (the CDN sends no CORS
 * headers, so a direct browser fetch of it fails), the poster via
 * next/image. These are public, unsigned asset URLs, not secrets, so
 * like the Amazon store link they live in source rather than in
 * environment variables.
 */
const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3G4bnJPvIHipa5YfpqpDWYcQAig";

export const heroMediaRemote = {
  /** The scrubbed hero film, 1080p: the plate bursts upward and hangs in the air */
  video: `${CDN}/hf_20260801_104539_ce158ce6-a3b8-4b7a-94a6-a1ece909b2fa.mp4`,
  /** The film's opening frame, so the still and the video line up exactly */
  poster: `${CDN}/hf_20260801_104254_5718f989-817c-4d67-a232-2e22ec424254_min.webp`,
} as const;

/**
 * The second take of the same shot, from the same start frame and prompt.
 * Nothing references it: it is here so the film can be swapped in one line
 * if the alternate reads better on a big screen. See docs/HERO_ASSETS.md.
 */
export const heroFilmAlternate = `${CDN}/hf_20260801_104539_3c93a0af-f578-4108-8335-9e3ba5a6359b.mp4`;
