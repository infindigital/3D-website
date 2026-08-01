/**
 * Ambient hero media generated on Higgsfield (backgrounds, dish video,
 * spice cutouts). Package artwork and the brand logo are owner-supplied
 * and never generated.
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
  /** 8s toss-and-settle dish shot: Gobi Manchurian, Chicken 65, fish fry */
  video: `${CDN}/hf_20260801_091029_3c59713f-ffe3-4311-9691-a03f6b124a70.mp4`,
  poster: `${CDN}/hf_20260801_073357_f4e77121-e7e9-4b06-8110-934badbddfa3_min.webp`,
  chilli: `${CDN}/hf_20260801_072655_43de60c5-4316-4312-bcbb-843518ac891b.png`,
  curryLeaf: `${CDN}/hf_20260801_072702_56752417-f220-42fe-ab46-066aff8a343f.png`,
  starAnise: `${CDN}/hf_20260801_072706_e884904a-6b09-44bc-8793-1cbfeb8f5245.png`,
} as const;
