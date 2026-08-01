# RS Chef'z - Cinematic 3D Product Website

A premium, cinematic, 3D animated brand experience for RS Chef'z masalas.
Not an ecommerce site: a storytelling landing experience for two products,
inspired by Apple launches, luxury perfume sites and high-end food commercials.

## Products

1. Gobi Manchurian Masala (Gobi / Mushroom / Paneer - Manchurian / Fry / Tikka)
2. 3 in 1 Masala (Chicken 65 / Fish Fry / Gobi Manchurian)

## Tech stack

- Next.js (App Router) + React + TypeScript
- Three.js + React Three Fiber + drei
- GSAP + ScrollTrigger for scroll storytelling
- Framer Motion for UI and page transitions
- Lenis smooth scrolling
- Vercel ready

## Getting started

```bash
cp .env.example .env.local   # then fill in values, see docs/ENVIRONMENT.md
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

Every token and configurable value lives in environment variables.
See `docs/ENVIRONMENT.md` for the full list and instructions.

## Deploying

The site deploys to Vercel with zero build configuration.
Follow `docs/DEPLOYMENT.md` for the step-by-step guide, custom domain
setup and the post-deploy checklist.

## Project structure

```
src/
  app/                 Routes: home + products/[slug]
  components/
    layout/            Navigation, footer, smooth scroll provider
    sections/          Page sections (hero, story, reveal, cards)
    ui/                Buttons, cards, micro-interactions
  animations/          GSAP timelines and scroll choreography
  three/               R3F scenes, materials, cameras
  hooks/               Shared hooks (viewport, mouse, scroll)
  utils/               Helpers
  config/              Site + product configuration
  styles/              Shared style modules
public/
  assets/
    brand/             Logo files (supplied by owner)
    products/          Package artwork (supplied by owner, never generated)
    textures/          3D textures
docs/                  Environment and integration documentation
```

## Build phases

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 | Project setup | Done |
| 2 | Navigation + Hero ("A Feast in Motion", scroll-scrubbed dish film) | Done, streams from the CDN until the file is self-hosted (see docs/HERO_ASSETS.md) |
| 3 | Interactive 3D pack stage | Done, real package artwork committed |
| 4 | Scroll storytelling (story reel, flavour scenes, ritual, promise, footer) | Done |
| 5 | Product pages (pinned 3D pack flip, dish parade, blend story, cross-link) | Done |
| 6 | Responsive (phone/tablet audit, flip + reel pacing, balanced pack artwork) | Done |
| 7 | Optimization (off-screen render pausing, texture preload, lighter artwork) | Done |
| 8 | Deployment (SEO, sitemap, OG card, headers, Vercel guide) | Done, see docs/DEPLOYMENT.md |

Each phase ships only after explicit approval of the previous one.

## Design rules

- Bright, fresh, food-inspired palette. The hero is the one deliberate
  exception: a charcoal and warm-brown stage so the food carries all the
  colour, washing out to cream before the page continues. Everything below
  it stays light.
- Fonts: Poppins (headings) + Manrope (body), loaded via next/font.
- Package artwork is supplied by the brand owner. Never generated.
- Cinematic timing, soft easing, natural motion. No template animations.
