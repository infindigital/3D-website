# RS Chef'z — dark edition

The same website as the one in the repository root, in a black theme.

It is a **complete, standalone copy**: its own `src`, `public`, `package.json`
and lockfile. It builds, runs and deploys entirely on its own, and nothing in
here is imported by the bright site — so work in this folder cannot affect
what is already live.

## Running it

```bash
cd dark
npm install
npm run dev          # http://localhost:3000
```

To run both editions side by side, start one of them on another port:

```bash
npm run dev -- -p 3001
```

## Deploying to Vercel

The bright site is already a Vercel project pointed at the repository root.
This folder becomes a **second project on the same repository** — the two do
not share a build, a domain or an environment.

1. Vercel dashboard → **Add New… → Project** → import this same repository.
2. Under **Root Directory**, click *Edit* and choose **`dark`**.
   This is the only setting that differs from the bright project, and it is
   the one that matters: it is what makes Vercel build this folder instead
   of the repository root.
3. Framework preset stays **Next.js**; leave the build and output settings
   at their defaults.
4. Deploy, then give it whatever domain the dark edition should answer on
   (a subdomain such as `dark.<yourdomain>` is the usual choice).

The existing project needs no changes at all. It keeps building from the
repository root, and pushing this folder does not trigger a rebuild of it
unless you have that project set to build on every commit.

## What differs from the bright edition

Only colour. The layout, the copy, the motion, the scroll-driven 3D world
and every asset are the same files.

- **`src/app/globals.css`** — the whole palette. The tokens keep their
  original names, so `--color-white` and `--color-cream` still mean "the
  page", they are simply dark here. `--color-true-white` was added for the
  few places that need a literal white *on top of* an accent (text on a
  chilli chip, a caption over a photograph) and must not follow the theme.
- **Surfaces that were hard-coded** rather than tokenised — the navigation
  glass, the hero's paper and buttons, the world's copy panels, the footer
  cards, two pills that sit over video.
- **Shadows** — warm brown throughout the bright edition, black here. A
  brown shadow on a charcoal ground is invisible, so the ink changed and
  the alpha roughly doubled.
- **`src/three/`** — the world's fog and clear colour, the light rig, and
  the contact shadows under the packs. Ambient came down and the key light
  went up: the packs are printed artwork and still have to read as print,
  but a high ambient on a dark page lifts the whole frame and the pack
  stops looking lit.

## Keeping the two in step

They are copies, not a shared library, so **a content or layout change made
in the root does not reach this folder**. Anything that is not colour —
new copy, a new section, a fixed bug — has to be made in both places.

The practical way to do that is to make the change in the root first, then
copy the touched files over and re-check them against this palette:

```bash
cp ../src/components/<the-file>.tsx src/components/<the-file>.tsx
```

Take care with the files listed under *What differs* above — those have
diverged on purpose, so copying one over will drag the bright colours back
in with it.
