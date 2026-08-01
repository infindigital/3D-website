# Hero ambient media

Ambient visuals for the hero section, generated with Higgsfield on 2026-08-01.
They are backgrounds, spice cutouts and textures only. Package artwork and the
brand logo are supplied by the owner and are never generated.

## How to fetch

From the repo root:

```bash
node scripts/fetch-hero-assets.mjs
```

Requires network access to `d8j0ntlcm91z4.cloudfront.net` (Higgsfield's CDN).
Commit the downloaded files afterwards, they are part of the site.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/hero/hero-loop.mp4` | 8s 1080p cinematic spice camera move, hero background video | Kling 3.0 Turbo, job `7f263f41` |
| `public/assets/hero/hero-poster.webp` | Video poster and reduced motion / mobile fallback | Marketing Studio, job `c0993610` |
| `public/assets/hero/chilli.png` | Floating chilli cutout, transparent | job `f3ff2f1c` + background remover |
| `public/assets/hero/curry-leaf.png` | Floating curry leaf cutout, transparent | job `a14a1073` + background remover |
| `public/assets/hero/star-anise.png` | Floating star anise cutout, transparent | job `c62b9c15` + background remover |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | job `0f7f323e` |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | job `ceb80041` |

The hero component checks for these files at build time and simply skips any
layer whose file is missing, so the site builds and runs before they land.
