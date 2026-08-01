/**
 * Hero film and poster frame, generated on Higgsfield. Package artwork and
 * the brand logo are owner-supplied and never generated.
 *
 * Local files under public/assets/hero always win. Until they are
 * committed (run scripts/fetch-hero-assets.mjs on a machine with CDN
 * access), the browser streams the same files straight from the
 * Higgsfield CDN below. These are public, unsigned asset URLs, not
 * secrets, so like the Amazon store link they live in source rather
 * than in environment variables.
 */
const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3G4bnJPvIHipa5YfpqpDWYcQAig";

export const heroMediaRemote = {
  /** The scrubbed hero film, 1080p: wide table down to a macro on the Gobi Manchurian */
  video: `${CDN}/hf_20260801_093933_87e152a2-bf03-4cbe-a524-908b4d030b34.mp4`,
  /** The film's opening frame, so the still and the video line up exactly */
  poster: `${CDN}/hf_20260801_093229_56726257-ad69-4c27-9c60-eb9faa3515ea_min.webp`,
} as const;
