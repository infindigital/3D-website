# The home world

Everything below the hero on `/` is one continuous 3D scene. The sections
are gone; what used to be `StoryReel`, `FlavourScene`, `Ritual` and
`PromiseBand` are now six *beats* of a single flight down a corridor, with
HTML panels captioning it.

```
src/components/home/HomeWorld.tsx        the page: overlay copy + scroll driver
src/components/home/HomeWorld.module.css the two layouts (see "Two layouts")
src/three/world/WorldCanvas.tsx          the one canvas, mounted once, asleep until near
src/three/world/flightPath.ts            camera path, pack slots, travelling light
src/three/world/film.ts                  which second of the film each beat owns
src/three/world/FilmDeck.tsx             the film, as tiled geometry
src/three/world/WorldPack.tsx            one sachet
src/three/world/bands.ts                 the fade shared by copy and film
src/three/world/worldState.ts            the one mutable object both sides read
```

## The single rule

**Scroll progress is the only clock.** `worldState.progress` runs 0 → 1 over
the world's `760vh`, written once per frame by the ScrollTrigger in
`HomeWorld.tsx`. The camera samples its curve at that value, each pack scales
against it, the travelling light runs against it, and every panel of copy
fades against it. Nothing is on a timeline of its own, so stopping mid-scroll
leaves a coherent frame and scrolling back retraces exactly.

Two files carry the numbers, and they have to agree:

- `flightPath.ts` — `CAMERA_KEYS` / `TARGET_KEYS` (where the lens is and
  what it looks at), `PACK_SLOTS`, `LIGHT_KEYS`.
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

That mapping is `FILM_SCREENS` in `film.ts`. The hero above plays the same
file whole — see [HERO_ASSETS.md](./HERO_ASSETS.md) — so by the time the
world's first screen fades up the footage is already decoded and in cache.
The tiled wall belongs to the world alone: the hero shows the footage
itself, and the wall is what the page becomes once you have left it. Each beat owns a *segment* of
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

## Asleep until it is nearly on screen

`HomeWorld` watches the world section with an IntersectionObserver and hands
`WorldCanvas` an `awake` flag; the canvas runs `frameloop="never"` until it
is set, and `FilmDeck` does not so much as ask for the film before then. A
third of a screen of warning is enough for the wall to be standing by the
time it is looked at.

This is not a saving in the abstract. The hero above is a 720p film playing
inside a CSS perspective, and a canvas drawing six walls of tiles at sixty
frames a second behind it was taking enough of the machine to make that film
stutter and stop. Mounted and drawing are separate things here, and they
need to stay separate: the scene is a pure function of scroll progress, so
the first frame after waking is simply the frame that belongs to where the
page is — there is no state to catch up on.

### Why it is geometry and not a video plane

Each screen in `FilmDeck.tsx` is 510 instanced tiles (`30 × 17`). As a beat
arrives the tiles come in from the surrounding dust, grow into their cells,
and settle into a gently bowed wall; each tile also pushes toward the lens by
however bright the film is *at that tile*, read with `textureLod` in the
vertex shader. So the plate of florets has relief and the dark pan falls away
behind it. Leaving the beat lets the tiles go again.

That is what makes the film part of the room rather than a background: the
packs stand in front of it, the camera passes it at an angle, and the
travelling light and the corridor's fog reach it.

Two things in that shader are load-bearing:

- The material is compiled `glslVersion: THREE.GLSL3`, because a vertex
  shader needs `textureLod` and three's WebGL2 prefix maps `texture2D` but
  not `texture2DLod`. GLSL ES 3.00 has no built-in fragment output, so the
  fragment shader declares `pc_fragColor` and `#define`s `gl_FragColor` onto
  it — that alias is what `#include <colorspace_fragment>` writes through.
- Settled tiles **overrun** their cell, by `OVERLAP`, and the uv overruns
  with the quad so a tile's spill draws its neighbour's own pixels rather
  than a stretched copy of its own. They have to: the tiles do not share a
  depth — that is the point of the relief, and the bow adds more of it out
  at the sides — and two quads at different depths seen through a
  perspective lens project to different sizes, so cells that abut exactly
  in the plane pull apart on screen and show the wall as a grid of seams.
- Overrunning is only half of it. The material is transparent, so a band
  drawn by two tiles is a band blended twice, and the gap comes back as a
  *bright* grid instead of a dark one. Each tile therefore carries a weight
  that falls from 1 to 0 across its overrun while its neighbour's rises, and
  the weight goes into the **exponent**, not onto the alpha:

  ```glsl
  float a = 1.0 - pow(1.0 - want, weight);
  ```

  Transmittance is what multiplies when layers stack, so `(1-a)` composites
  to exactly `(1-want)` however the band is split — whereas halving the two
  alphas would compose to three quarters of one tile and read as a dark
  grid. Once the handover is exact, spilling further is nearly free, which
  is why `OVERLAP` is set past the worst corner of the worst screen rather
  than measured against it.

`DEPTH` is deliberately small. Relief is what stops the wall reading as a
sticker, but past a point the tiles pull apart and it reads as a broken
mosaic instead of a film.

### The grade, and why nothing is tone-mapped

`WorldCanvas` asks for `THREE.NoToneMapping`. R3F defaults the renderer to
ACES filmic, and a raw `ShaderMaterial` that does not include
`<tonemapping_fragment>` — this one — is not tone-mapped regardless, so the
default has the packs graded one way and the film beside them another: the
packs come out grey next to footage that was never touched. Turning it off
is what makes the two agree.

With nothing rolling off the top end, the film's own grade is deliberately
gentle and both ends are left alone: `SATURATION` swings around the frame's
luminance so the cream ceiling and the white plates stay neutral while the
chilli and turmeric come up, and `CONTRAST` swings around mid-grey so the
oil darkens as the crust brightens. A gamma lift would be the obvious move
and is the wrong one — the film is an evenly lit kitchen already, and
lifting it turns most of the frame to milk. For the same reason the rim
light in `WorldPack.tsx` is held low: nothing is clamping it any more.

## Two layouts

`HomeWorld.module.css` defines the *ordinary page* — one section after
another, no pinning, no canvas — and then adds the immersive world inside one
media query:

```css
@media (min-width: 1024px) and (min-height: 640px)
   and (pointer: fine) and (prefers-reduced-motion: no-preference)
```

That exact string is repeated verbatim as `IMMERSIVE` in `HomeWorld.tsx` and
handed to `gsap.matchMedia`. **The two must stay in step.** Deciding the page
shape in the stylesheet rather than in an effect is what keeps the first
paint correct, before any JavaScript has run and before the canvas exists;
the effect only *drives* the shape the CSS has already chosen.

Each condition is there for a reason worth keeping:

- **`pointer: fine`** — a mouse, which in practice means "not a tablet". This
  used to be a bare `min-width: 768px`, which handed a portrait iPad a
  nine-screen pinned WebGL flight. Two things were wrong with that, and the
  cheaper one was the frame rate (**8.8 fps, 45 janked frames and a 689 ms
  longest task** across a six-second scroll at 820×1180; the flat page at the
  same size is a flat 60 with no long tasks at all). The worse one was the
  composition: the corridor is laid out for a frame you look *across*, with
  the packs to one side and the copy in the other half. A portrait tablet has
  no other half, so the words landed on the artwork and the rail landed on
  the words.
- **`min-width` / `min-height`** — enough window to hold that composition. A
  desktop browser dragged narrow or short is in the same position as the
  tablet was.
- **`prefers-reduced-motion`** — the flight *is* the motion; there is no
  reduced version of it worth having.

In the flat layout every panel is opaque and in normal flow, there is no
canvas, and the film appears once as an ordinary `<video>` — autoplaying and
looping where motion is welcome, and paused with controls under
`prefers-reduced-motion: reduce`, so it is offered rather than imposed. It is
not a lesser version of the world: it is the same six acts read straight
down, and it stays legible at any width.

### The flat layout's own tuning

Two things it needs that the desktop column does not:

- **The pack artwork sets a width and lets the height follow.** `.packShot`
  used to set only the link's width; the picture inside kept the height from
  its markup attributes, so on a phone a pouch 0.78 wide for its height was
  drawn at 128 × 560 — a quarter of its width, stretched down the screen.
  `.packShot img` is now `width: 100%; height: auto`, and the `width`/`height`
  passed to `next/image` (`PACK_ART`) are the artwork's real proportions —
  they are a *ratio*, not a size, and getting them wrong distorts the pack
  rather than scaling it.
- **Less air below 1024px.** The beat padding is `11vw`, measured against a
  desktop column. Repeated down a hand-held page that becomes a screen of
  nothing between every two things worth reading, which is the whole of what
  makes a page feel long rather than generous.

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
The film is owner-supplied too, and it is the only film on the page: the
hero plays it as well. `kitchen-film-poster.webp` is a frame pulled from the
film itself (9.35 s) and is only used by the flat layout's `<video>`.

Nothing on this page is fetched from a third-party host. `next.config.ts`
declares no `remotePatterns` for exactly that reason.

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
