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

## Project structure

```
src/
  app/                 Routes: home + products/[slug]
  components/
    layout/            Navigation, footer, smooth scroll provider
    sections/          Page sections (hero, story, reveal, cards)
    ui/                Buttons, cards, micro-interactions
  animations/          GSAP timelines and scroll choreography
  three/               R3F scenes, particles, materials, cameras
  hooks/               Shared hooks (viewport, mouse, scroll)
  utils/               Helpers
  config/              Site + product configuration
  styles/              Shared style modules
public/
  assets/
    brand/             Logo files (supplied by owner)
    products/          Package artwork (supplied by owner, never generated)
    textures/          3D textures and particle sprites
docs/                  Environment and integration documentation
```

## Build phases

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 | Project setup | Done |
| 2 | Navigation + Hero (dish video, scroll 3D, pack showcase) | Done, media fetch pending (see docs/HERO_ASSETS.md) |
| 3 | 3D Hero | Pending |
| 4 | Scroll animations | Pending |
| 5 | Product pages | Pending |
| 6 | Responsive | Pending |
| 7 | Optimization | Pending |
| 8 | Deployment | Pending |

Each phase ships only after explicit approval of the previous one.

## Design rules

- Bright, fresh, food-inspired palette. No dark backgrounds.
- Fonts: Poppins (headings) + Manrope (body), loaded via next/font.
- Package artwork is supplied by the brand owner. Never generated.
- Cinematic timing, soft easing, natural motion. No template animations.
