# Hero ambient media

Ambient visuals for the hero section, generated with Higgsfield on 2026-08-01.
The hero video is an 8s cinematic shot of the signature dishes (Gobi
Manchurian, Chicken 65, Fish Fry) tossing up in slow motion and settling
back onto the plate, with a subtle 3D camera orbit. Everything here is dish
scenery, spice cutouts and textures only. Package artwork and the brand
logo are supplied by the owner and are never generated.

## Streaming fallback (no action needed to go live)

The site does not wait for these files. `src/config/heroMedia.ts` holds the
public CDN URL of every hero asset, and the home page resolves each one at
build time: a committed file under `public/assets/hero` wins, anything
missing streams straight from the CDN. The hero is therefore complete on
the very first deploy.

## Self-hosting the files (recommended eventually)

Serving from your own domain avoids a third-party dependency. On any
machine with access to `d8j0ntlcm91z4.cloudfront.net` (Higgsfield's CDN),
run from the repo root:

```bash
node scripts/fetch-hero-assets.mjs
```

Commit the downloaded files afterwards; the next build picks them up
automatically and stops using the CDN.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/hero/hero-loop.mp4` | 8s 1080p hero background video: Gobi Manchurian, Chicken 65 and Fish Fry toss up in slow motion and settle back onto the plate, subtle 3D camera orbit | Kling 3.0 Turbo job `d93232db`, upscaled to 1080p by job `3c59713f` |
| `public/assets/hero/hero-poster.webp` | Video poster and reduced motion / mobile fallback, same dish scene | Marketing Studio, job `f4e77121` |
| `public/assets/hero/chilli.png` | Floating chilli cutout, transparent | job `f3ff2f1c` + background remover |
| `public/assets/hero/curry-leaf.png` | Floating curry leaf cutout, transparent | job `a14a1073` + background remover |
| `public/assets/hero/star-anise.png` | Floating star anise cutout, transparent | job `c62b9c15` + background remover |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | job `0f7f323e` |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | job `ceb80041` |

The hero component checks for these files at build time and simply skips any
layer whose file is missing, so the site builds and runs before they land.
