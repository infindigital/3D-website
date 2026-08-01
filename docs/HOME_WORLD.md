# The home world

Everything below the hero on `/` is one continuous 3D scene. The sections
are gone; what used to be `StoryReel`, `FlavourScene`, `Ritual` and
`PromiseBand` are now six *beats* of a single flight down a corridor, with
HTML panels captioning it.

```
src/components/home/HomeWorld.tsx        the page: overlay copy + scroll driver
src/components/home/HomeWorld.module.css the two layouts (see "Two layouts")
src/three/world/WorldCanvas.tsx          the one canvas, mounted once
src/three/world/flightPath.ts            camera path, pack slots, ritual rings
src/three/world/film.ts                  which second of the film each beat owns
src/three/world/FilmDeck.tsx             the film, as tiled geometry
src/three/world/SpiceField.tsx           the drifting spice
src/three/world/WorldPack.tsx            one sachet
src/three/world/bands.ts                 the fade shared by copy and film
src/three/world/worldState.ts            the one mutable object both sides read
```

## The single rule

**Scroll progress is the only clock.** `worldState.progress` runs 0 → 1 over
the world's `760vh`, written once per frame by the ScrollTrigger in
`HomeWorld.tsx`. The camera samples its curve at that value, each pack scales
against it, the spice gathers against it, and every panel of copy fades
against it. Nothing is on a timeline of its own, so stopping mid-scroll
leaves a coherent frame and scrolling back retraces exactly.

Two files carry the numbers, and they have to agree:

- `flightPath.ts` — `CAMERA_KEYS` / `TARGET_KEYS` (where the lens is and
  what it looks at), `PACK_SLOTS`, `RITUAL_RINGS`.
- `HomeWorld.tsx` — `BANDS`, the progress range each panel of copy is up for.

Move a camera key without moving the matching band and a panel ends up
printed across a pack. The comments in both files say which beat is which.

Panel bands **overlap** where the copy is a sequence (the three story
statements) and leave a gap where it isn't (between the two flavour beats).
A gap is a deliberate moment of pure world; butted bands are a bug, because
each band fades out over its last 30% and a butt join shows the page empty
for that width.

## The film

`public/assets/home/kitchen-film.mp4` is a ten-second film shot with the real
packets. Its six shots happen to be, in order, exactly the six beats this
page already told:

| seconds | shot | beat |
| --- | --- | --- |
| 0.15–2.35 | gobi florets tossing over the plate | lineup |
| 4.5–5.5 | masala and curry leaves onto the chicken | story |
| 7.45–8.65 | the gobi pack beside its finished plate | flavour0 |
| 2.45–4.45 | the chef holding and opening the 3 in 1 sachet | flavour1 |
| 5.55–7.4 | into the oil, frying | ritual |
| 8.75–9.95 | both packs behind both plates | finale |

That mapping is `FILM_SCREENS` in `film.ts`. Each beat owns a *segment* of
seconds and a *band* of progress, and the segment **plays** while its band is
up — it is not scrubbed. A cooking film scrubbed by a scroll wheel is a
slideshow; the oil has to actually bubble. Scroll picks the shot, the shot
keeps its own time. Short segments are slowed by `segmentRate()` so one pass
takes around three seconds.

There is one `<video>` and one `THREE.VideoTexture` behind all six screens.
The element is created with `document.createElement` and never appended to
the DOM: it is a texture source, not a player. Only one screen is ever near
full strength, so the single decoder is always showing the shot the screen in
front of you is asking for. It pauses whenever `worldState.active` is false —
the world scrolled off — which is the difference between decoding for the
whole visit and decoding while watched.

### Why it is geometry and not a video plane

Each screen in `FilmDeck.tsx` is 510 instanced tiles (`30 × 17`). As a beat
arrives the tiles come in from the surrounding dust, grow into their cells,
and settle into a gently bowed wall; each tile also pushes toward the lens by
however bright the film is *at that tile*, read with `textureLod` in the
vertex shader. So the plate of florets has relief and the dark pan falls away
behind it. Leaving the beat lets the tiles go again.

That is what makes the film part of the room rather than a background: the
packs stand in front of it, the spice drifts across it, and the travelling
light passes over it.

Two things in that shader are load-bearing:

- The material is compiled `glslVersion: THREE.GLSL3`, because a vertex
  shader needs `textureLod` and three's WebGL2 prefix maps `texture2D` but
  not `texture2DLod`. GLSL ES 3.00 has no built-in fragment output, so the
  fragment shader declares `pc_fragColor` and `#define`s `gl_FragColor` onto
  it — that alias is what `#include <colorspace_fragment>` writes through.
- Settled tiles fill their cell **exactly**. Anything less (the obvious
  `* 0.985` to avoid overlap) shows every tile edge in the wall as a cream
  seam.

`DEPTH` is deliberately small. Relief is what stops the wall reading as a
sticker, but past a point the tiles pull apart and it reads as a broken
mosaic instead of a film.

## Two layouts

`HomeWorld.module.css` defines the *ordinary page* — one section after
another, no pinning, no canvas — and then adds the immersive world inside one
media query:

```css
@media (min-width: 768px) and (prefers-reduced-motion: no-preference)
```

That exact string is repeated verbatim as `IMMERSIVE` in `HomeWorld.tsx` and
handed to `gsap.matchMedia`. **The two must stay in step.** Deciding the page
shape in the stylesheet rather than in an effect is what keeps the first
paint correct, before any JavaScript has run and before the canvas exists;
the effect only *drives* the shape the CSS has already chosen.

In the flat layout every panel is opaque and in normal flow, there is no
canvas, and the film appears once as an ordinary `<video>` — autoplaying and
looping where motion is welcome, and paused with controls under
`prefers-reduced-motion: reduce`, so it is offered rather than imposed.

## Accessibility

A panel that is faded out is set `visibility: hidden`, not merely
`opacity: 0`. An invisible panel that keeps its tab stops is a trap: focus
lands on a button nobody can see and the page appears to scroll on its own.
`pointer-events: none` goes on any panel that is not the one currently up,
so a fading panel never eats a click meant for the one arriving.

The rail down the right side is real `<button>`s that scroll to a stop, so
the 760vh flight is navigable without a scroll wheel.

## Assets

The packet artwork and the logo are owner-supplied files, never generated.
The film is owner-supplied too. `kitchen-film-poster.webp` is a frame pulled
from the film itself (9.35 s) and is only used by the flat layout's `<video>`.

## Verifying a change

The world is WebGL, so a diff tells you very little. Screenshot it:
headless Chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader`,
scroll to a list of progress values, and look at the frames. Two things to
know before you do:

- The bundled Chromium has no H.264, so the mp4 has to be intercepted and
  served as WebM for the harness. Real browsers get the mp4 untouched.
- Redirect that interception at a **static file** (`route.continue({url})`),
  never `route.fulfill` with a buffer. A fulfilled response carries no
  `Accept-Ranges`, so the element reports the film as unseekable, every
  segment cue is silently clamped to zero, and all six screens sit on frame
  one while looking, at a glance, like they are working.
- `document.querySelector("video")` finds the hero's element, not the film
  deck's — the deck's video is never in the DOM.
