# Hero film

The hero plays one live-action style shot of the signature dishes, generated
with Higgsfield on 2026-08-01: a bright kitchen table with Gobi Manchurian,
Chicken 65 and fish fry, the camera gliding from a wide view down into a tight
macro on the glazed cauliflower with steam rising through the frame.

Scrolling is what plays it. The hero holds still while the letterbox window
opens to full bleed, and from there the scroll position drives the film's own
playhead, so the camera move advances only as far as the visitor scrolls and
the page continues to the products the moment the shot lands.

Everything here is dish scenery and texture only. Package artwork and the
brand logo are supplied by the owner and are never generated.

The poster is the film's opening frame, so nothing jumps when the video takes
over from the still.

## Streaming fallback (no action needed to go live)

The site does not wait for these files. `src/config/heroMedia.ts` holds the
public CDN URL of every hero asset, and the home page resolves each one at
build time: a committed file under `public/assets/hero` wins, anything
missing streams straight from the CDN. The hero is therefore complete on
the very first deploy.

Because the film is scrubbed rather than played, the browser needs the file
buffered. It starts downloading on the first scroll, wheel, touch or pointer
event, and the hero only claims its full scroll length once the file is ready,
so a slow connection never leaves a dead screen. Phones and visitors who ask
for reduced motion get the still frame and a shorter hero instead.

## Self-hosting the files (recommended eventually)

Serving from your own domain avoids a third-party dependency and gives the
scrub a faster, range-request friendly source. On any machine with access to
`d8j0ntlcm91z4.cloudfront.net` (Higgsfield's CDN), run from the repo root:

```bash
node scripts/fetch-hero-assets.mjs
```

Commit the downloaded files afterwards; the next build picks them up
automatically and stops using the CDN.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/hero/hero-loop.mp4` | The hero film, scrubbed by scroll: wide table down to a macro on the Gobi Manchurian | Kling 3.0 Turbo job `1316c66e` from still `56726257`, upscaled to 1080p by job `87e152a2` |
| `public/assets/hero/hero-poster.webp` | Poster frame, and the still shown on phones and with reduced motion. Identical to the film's first frame | Nano Banana job `56726257`, retouched from `1ffce283` |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | job `0f7f323e` |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | job `ceb80041` |

The hero resolves these at build time and falls back to the CDN for any that
are missing, so the site builds and runs either way.
