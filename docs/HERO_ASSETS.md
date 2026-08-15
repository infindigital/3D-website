# Hero film

The hero plays `public/assets/home/kitchen-film-v2.mp4` — the owner's ten-second
kitchen film, shot with the real packets. It is the same file the 3D world
below the hero is built from, cut differently: the hero plays the whole ten
seconds on a loop, the world takes six shots out of it and holds each one on
a tiled screen standing in the corridor (see
[HOME_WORLD.md](./HOME_WORLD.md)).

One film, one download, one decoder warm by the time the world starts.

Package artwork and the brand logo are owner-supplied and are never
generated. So is the film. Nothing on this page comes from a third-party
host — `next.config.ts` declares no `remotePatterns`, and there is no CDN
fallback to fail over to, because there is nothing to fall back from.

## The page opens on the film

There is no title card in front of the hero and no cut into it. The page
opens on a sheet of restaurant orange with the film already running inside
its organic shape, the brand mark standing in the middle of it and thin
outline rings pushing outward past it to the edges of the room. Then the
orange collapses inward, the mark flies up into the navigation bar, and what
is left standing there is the hero.

`Hero.tsx` holds the beats:

| Second | What happens |
| ------ | ------------ |
| 0.0 | Orange sheet, film at full size, logo on it, rings pushing outward. |
| 1.6 | The orange starts collapsing into the film. |
| 2.2 | The room is the hero's: the header is told it may come down, and the logo sets off for it. |
| 2.4 | The buttons rise into place. |
| 3.35 | The logo lands; the bar's own mark comes up under it. |
| 3.7 | Scroll is unlocked and everything the intro owned is unmounted. |

**Nothing in the intro is a fade, a cut, or a growth.** The film is one
element at one size throughout. The rings run on one clock and leave through
the same door the orange does. The logo is one element that travels. The
only thing that actually *happens* is that the orange leaves.

That is a deliberate change from an earlier version in which the shape crept
and then opened out. The size of the film, the rings around it and the mark
standing on it are the composition the page opens on; a composition that
swells for three seconds is a different composition, and the swell was the
only part of it that had to be re-justified on every screen.

**The film lives in the hero, not in the intro.** An intro that owns its own
video has to hand over to a second one at the join, and a second one is a
second decoder, a second buffer and a visible jump. Here the intro never
touches the hero's element at all, so the frame playing at 0.0 is the frame
playing at 3.7 — "the video does not restart" is a structural fact rather
than two players being resynchronised.

**The orange collapses rather than fades.** `.intro` is clipped to
`circle(var(--wipe) at 50% var(--film-cy))`, and the timeline closes `--wipe`
on that point. Everything still visible is the part of the sheet *outside* the
film; once the circle is smaller than the film there is no orange left. No
crossfade happens at any point, which is why there is no moment where two
pictures are on screen at half strength.

The clip is on the sheet, not on the things inside it. The orange and the
rings are one sheet and have to leave through one door; clipping `.intro`
makes that true by construction rather than by two declarations happening to
carry the same value. It also frees the ring layer to drift with the pointer
alongside the film — a clip on an ancestor applies to whatever its children
paint, wherever they paint it, so the layer can move without dragging the
closing edge with it.

## The rings belong to the opening, and only to the opening

They live inside `.intro` and share its clip, so they close on the centre in
step with the orange and are gone the moment it is. No fade of their own, no
second set carrying on underneath, and nothing still running behind a hero
that has finished. The hero the visitor is left standing in is paper, the
words crossing it, the herbs and the film.

An earlier version drew them twice on one clock so they could cross the join
and keep going in the hero's own ink. It worked, and it was removed on
purpose: rings that never stop are a moving thing in the corner of the eye
for as long as the page is open, and the hero reads calmer without them. If
they are ever wanted back in the hero, the way to do it is that one — two
layers, one clock, different ink — not a second animation handing over.

Their reach is also **the one number in the opening with a cost attached**.
Each ring is a translucent sheet the compositor blends over everything behind
it, at exactly the moment the film is decoding its first frames, so
`@keyframes ripple` ends at 2.25× — just past the widest room the film is
sized for. Past that it is paying to draw off-screen. `RING_COUNT` is the
other lever; on a phone the reach is what pushes them off the sides of the
screen and the count is what turns the opening into a lattice.

**A ring is brightest where it is still wrapped around the picture.** `ripple`
falls to 0.5 by 46% of its travel and 0.16 by 76%, rather than holding near
full strength to the end. This is not decoration, it is what keeps a phone
readable: the film is most of the width of the screen there, so every ring
past the first is wider than the screen and shows only its top and bottom
edge. Held bright, those edges read as horizontal rules ruled across the room.
Faded, they read as what they are — the near ring is the subject and the rest
are its wake.

## One centre, and it is not the middle of the screen

The film is centred between the bar above and the buttons below. That is not
the middle of the hero: the buttons need far more room than the bar, and on a
phone in a column they need most of the bottom of the screen, so the picture
sits some seventy-five pixels high of centre.

Everything in the opening is aimed at *that* point rather than at the screen's:

```css
--film-top: calc(var(--nav-height) + 14px);
--film-bottom: clamp(96px, 15vh, 156px);
--film-cy: calc(50% + (var(--film-top) - var(--film-bottom)) / 2);
```

`.stage` and `.rings` are both padded by the first two — one holds the film,
the other lays the rings out in the same room, so both centre on the same
point without an offset being written anywhere. The wipe is centred on the
third, so the orange closes onto the picture rather than onto a spot below it.
A breakpoint that gives the buttons more room moves the film, the rings and
the closing orange together; there is no fourth place for any of them to fall
out of step. This is what the phone breakpoint overrides — not `.stage`'s
padding directly.

The rings are laid out rather than positioned: `.rings` is a grid with
`place-items: center`, and every ring is `grid-area: 1 / 1`, so they stack in
one cell. Absolute positioning cannot be used here, because the containing
block for an absolutely positioned child is its ancestor's **padding** box —
the padding that defines the film's room would be invisible to them.

They are also cut from the film's own footprint. `--film-w`, `--film-ar` and
`--film-cut` on `.hero` are the only place the picture's size and outline are
decided, and the rings read all three, which is what makes them concentric
offsets of the shape rather than ovals drawn near it. Change a breakpoint and
they follow.

## The hero stands down when it is off screen

The same `IntersectionObserver` that pauses the film writes
`data-live="false"` on the section, and the stylesheet puts
`animation-play-state: paused` on the words, the herbs, the film's breathe
and the shape's morph. All of it is compositor work, which is to say cheap —
but cheap *per frame*, and the 3D world below wants every frame it can get
once the hero has left. `animation-play-state` pauses a clock rather than
rewinding one, so the room picks up mid-stride when it comes back.

## The brand flies out of the film

The logo starts centred on the film — a little under half its width, the
proportion the reference hero gives its wordmark — and lands in the
navigation bar's own brand slot. `.brandFly` is one element carrying one
uniform scale, so the mark never distorts on the way.

Both ends are **measured, not written down**. The near end comes off the
film's box, whatever the breakpoint made it; the far end off the bar's own
brand element, whatever it is set in. Neither can drift out of agreement with
the thing it is describing.

The far end has a wrinkle: the bar enters from above, so during the intro its
brand is not where it will end up. `restingBox()` reads the header's current
transform and takes it back off, which gives the resting box whether the bar
has not started moving or is halfway down.

Three smaller things hold it together:

- **The bar holds its own mark** until `HERO_BRAND_EVENT` says the flying one
  has landed (`Navigation.tsx`, home page only, with
  `HERO_BRAND_FALLBACK_MS` behind it). Two of the same mark on screen at once
  is the one thing that would show the trick.
- **They cross over rather than swap.** The flying mark fades out over the
  same third of a second the bar's fades in, both standing on the same box at
  the same size. A hard swap would show every sub-pixel of disagreement.
- **It is portalled to `document.body`.** The hero is a stacking context of
  its own and the bar is not inside it, so nothing rendered in the hero, at
  any z-index, can land on top of the bar.

The logo is owner-supplied artwork in red, green and near-black, and a
kitchen is dark, so it needs light under it: `.brandGlow` is a soft pool that
dissolves over the first half of the flight, leaving the artwork on its own
by the time it reaches the bar. A hard plate would have read as a sticker on
the film and would have had to be explained away at the other end.

## The stylesheet is the finished hero; the script is the opening frame

`Hero.module.css` describes the **finished** hero and nothing else. The
intro's opening frame — the buttons parked below their line, the logo
standing on the film — is written by `gsap.set()` in a layout effect, before
the browser has painted. The film is the same size in both, so there is
nothing to set on it.

That split is the whole no-JS and reduced-motion story. A visitor whose
bundle never arrives, or who has asked for less motion, gets an ordinary
still hero rather than an intro frozen at frame one. `mode` decides which,
and it is resolved before first paint:

- `"still"` — reduced motion. No intro is mounted, and **no `<video>` is
  mounted at all**; the poster is the hero.
- `"intro"` — everything above.

The `<video>` is rendered only in `"intro"`, so the still hero never costs a
download.

## Starting the download before the bundle

That split has a cost: the element that plays the film is not in the first
HTML, because `mode` is not known until hydration. Left alone the film would
not be *asked for* until the bundle had landed and run — measurably a third
of a second on a local server, and seconds on a phone.

`WARM_FILM` in `app/page.tsx` is an inline script that asks for the bytes
while the parser is still in the page, using a video element that never
enters the document and never plays. It exists to fill the HTTP cache, which
the real `<video>` reads from a moment later. Measured here: the request
moves from ~287ms to ~56ms, and there is still exactly **one** of it.

Two things about it are load-bearing:

- **It is guarded by the reduced-motion media query.** That visitor is shown
  the poster and never mounts a player, so they must never be made to pay
  for one. Verified by counting requests for the mp4 with
  `reducedMotion: "reduce"`: it is zero.
- **`<link rel="preload">` cannot do this job.** Chrome rejects `as="video"`
  outright — "`<link rel=preload> uses an unsupported as value`" — and
  fetches nothing at all, which is easy to mistake for success because the
  page still works. The other `as` values do fetch, under a credentials mode
  the video element will not reuse, so they cost a second download rather
  than saving the first.

`Hero` drops the warm element on `loadeddata`, and again at the end of the
intro in case that event never came; holding it costs a second buffer of the
same film.

## The room around the film

All of it is transform and opacity on layers the compositor already owns.
No canvas, no per-frame readback, nothing measured during a scroll.

- **Words** — three bands of huge display type crossing the room at
  different speeds, the middle one running the other way. Each band prints
  its words twice and travels exactly `-50%`, so the loop has no seam. The
  words cycle through three inks: the brand's exact orange, its exact red,
  and one word in three drawn as an outline rather than filled. Nothing is
  washed out to make room — the colours are the real ones at full strength,
  and the drawn word is what keeps a band of solid colour from becoming a
  slab. The eye reads the hollow letters as air, so the room breathes
  without the ink having to be watered down. Rows are offset by their own
  index, so all three inks are on screen at once and no two rows put the
  same one in a column.
- **Herbs** — curry leaf, chilli and peppercorn at three depths. Each bit
  drifts on its own clock (`.bit`), and the whole depth layer swings with
  the pointer (`.airLayer`). Two transforms on two elements — never both on
  one, or they fight. The nearest layer is defocused, which is what puts the
  film at the depth the eye is meant to read.
- **The shape** — an eight-value `border-radius` on a 26s loop. It is a
  rounded rectangle with no two corners alike, which is the outline the
  reference hero uses: rectangular enough to be a frame around a film, uneven
  enough never to read as a box, and never the same twice.
- **The picture** — a slow scale inside the shape, so it is never perfectly
  still.

**Only the shape's width is ever chosen.** Its height comes from
`aspect-ratio`, so no breakpoint can turn the frame into a crop. Setting the
two independently is how a landscape kitchen becomes a close-up of a plate:
the first narrow screen makes the frame taller than it is wide, `object-fit:
cover` fills it from the middle, and the room the film was shot in is gone.
The width's third `min()` term is the short-window guard — when there is not
enough height for the bar above and the buttons below, the width gives way
rather than the ratio. A phone is the one place the ratio itself changes, to
3:2: it has width to spare and height to save, and an eighth off the sides
still leaves the whole pan in frame.

All of it lives in `--film-w`, `--film-ar` and `--film-cut` on `.hero`, and
a breakpoint changes those rather than the rules that read them — because the
rings read them too, and a picture and its rings that disagree about their
own size is not a thing anybody would notice until it shipped.

**On a phone the opening's rings are what caps the width.** 84vw rather than
the 92vw it would otherwise take: above that, not even the first ring closes
on both sides inside the screen, and there is nothing left for the eye to read
the cropped ones as. At 84vw the first ring does close, and the rest — which
are wider than the screen no matter what, and are faded for exactly that
reason — read as its wake running off the sides. The film keeps that width for
the rest of the visit, long after the rings have gone, because the one thing
it must never do is change size.

## Keeping it moving

A film that starts and then freezes halfway is worse than one that never
starts. Four things are in place for that, and they are worth knowing about
before any of them is changed back.

- **The file is encoded for this.** 1280×720, 10s, **no audio track**, and a
  keyframe every twelve frames. The audio was dead weight — every consumer
  plays it muted — and the dense keyframes are for the world below, whose
  six screens each cue their own segment by seeking. A seek that has to walk
  from a distant keyframe is a stall. Re-encode with:

  ```
  ffmpeg -i in.mp4 -an -c:v libx264 -profile:v main -pix_fmt yuv420p \
    -crf 29 -preset veryslow -tune film \
    -g 12 -keyint_min 12 -sc_threshold 0 -movflags +faststart \
    public/assets/home/kitchen-film-v2.mp4
  ```

  Resolution is worth more here than bitrate, and it is not close: at a
  matched file size, keeping 1280×720 and spending the saving on the
  quantiser measured better than downscaling to 1024×576 and encoding it
  richly (SSIM 0.987 against 0.983). Cut the quantiser before the pixels.

- **Nothing blurs the picture.** A `backdrop-filter` is not a layer drawn
  over the film — it is the film read back out of the frame buffer, blurred
  and composited again, for every frame. It is the most expensive thing that
  can sit over a playing video. Do not put one over the stage.

- **The world below does not draw while the hero is up.** `WorldCanvas`
  takes an `awake` prop and runs `frameloop="never"` until an
  IntersectionObserver in `HomeWorld` says the world has come into view;
  `FilmDeck` does not even fetch the film until then. **That observer's
  `rootMargin` has to be read against the height of the hero in front of
  it.** It used to wake the world a third of a screen early, which was right
  while the hero was several screens tall and wrong the moment the hero
  became exactly one screen tall — the world's top edge then sits at the
  fold, so a positive margin means the world is awake, canvas drawing and
  second decoder running, from page load. It is `0px 0px -6% 0px` now: the
  world sleeps until it is genuinely on screen, and there is still a full
  screen of scrolling before any of its content has to be right.

- **The hero's own player stands down early.** It pauses below 40% of the
  hero being on screen rather than waiting to leave entirely, so the overlap
  with the waking world is as short as it can be.

**What the watchdog does not do.** It asks a *paused* element to play, once
a second and on `visibilitychange`, and nothing else. An earlier version
sampled `currentTime` and escalated to jogging the playhead and reloading
the element. Both of those are worse than the stall they were written for: a
seek throws away the decoder's work, and a reload starts the download again.
A watchdog that fires on a healthy film is indistinguishable from the fault.

## The header

The hero owns when the bar arrives, and when the mark on it does. At `2.2s`
it fires `HERO_OPEN_EVENT` and at `3.35s`, when the flying logo lands,
`HERO_BRAND_EVENT` (both in `src/utils/heroOpen.ts`); `Navigation.tsx`
listens for both on the home page only, each with its own fallback timer
behind it so a hero that never mounts cannot leave the site without its
navigation or without its name. Everywhere but the home page the bar and its
mark are there from the start.

The bar is transparent at the top of every page and takes its glass only
once the page has moved.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/home/kitchen-film-v2.mp4` | The film. Played whole by the hero, cut into six segments by the world. 1280×720, 10s, silent, 0.5s keyframes, ~1.6 MB | owner-supplied, re-encoded |
| `public/assets/home/kitchen-film-poster-v2.webp` | The film's own frame 0. One file for three jobs: the hero's poster, the whole picture under reduced motion, and the poster on the flat layout's ordinary `<video>` | pulled from the film |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | generated |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | generated |

The poster is the film's own frame 0, pulled straight out of the mp4. That
is not a nicety: the still and the video are registered to the same pixel,
so the dissolve between them has nothing to give away. Re-pull it whenever
the film is re-encoded — and if the re-encode changes the picture rather
than just its compression, give both files a new name. A browser holds the
video it already has, and Next's image optimizer keeps its own copy of every
still it has resized, keyed on the source path; same path, same old frame,
however many times the file on disk is replaced.

```
ffmpeg -i public/assets/home/kitchen-film-v2.mp4 -frames:v 1 \
  -c:v libwebp -quality 84 public/assets/home/kitchen-film-poster-v2.webp
```

## Verifying a change

Headless Chromium ships without H.264, so **screenshots show the poster
frame and real playback cannot be confirmed in this environment.** To probe
playback the mp4 has to be intercepted and served as WebM. Redirect that
interception at a **static file** (`route.continue({url})`), never
`route.fulfill` with a buffer: a fulfilled response carries no
`Accept-Ranges`, and the world's six screens each cue their own segment by
seeking, which a body served without ranges silently clamps to zero.

Sitting still is the test that matters for stalling, and it is the one a
stop-by-stop sweep will not do: park in the hero and sample `currentTime`
once a second for ten or twelve seconds. It should advance by almost exactly
one second each time and wrap at ten. Any sample that repeats the one before
it is the film stopping.

The world's own player is `document.createElement`d and never enters the
DOM, so a harness has to hook `createElement` to reach it. Two things to
check on it: it has no `src` at all while the page is sitting in the hero,
and it is playing once the world is on screen. The first of those is the
regression test for the `rootMargin` above.

Worth checking on every hero change, because each has broken once: the hero
is exactly one viewport tall at 1440×900, 1180×820, 820×1180 and 390×844;
`scrollWidth === clientWidth` on all four; scroll is unlocked after the
intro; and reduced motion mounts zero `<video>` elements. Add a short window
(1440×620) to that list for the film's own sizing — that is the one where
the shape and the buttons will collide if the width's short-window term goes
missing.

Two counts are worth taking on any change to how the film is fetched: how
many requests go out for the mp4 (one), and how many go out under
`reducedMotion: "reduce"` (none).

Three more for the intro, none of which a screenshot will show you:

- **The logo lands on the bar's own box.** Sample `.brandFly` and
  `[data-brand-anchor]` at the end of the flight; the two rects should agree
  to the pixel. They are measured from different things, so a layout change
  that moves one and not the other shows up here and nowhere else.
- **No frame has neither mark.** Poll both elements' opacity every frame
  through the intro and count the frames where both are under a third. It
  should be zero — that is the crossfade doing its job, and an off-by-a-beat
  timeline is invisible to the eye at full speed but obvious in the trace.
- **The rings arrive and leave with the intro.** `RING_COUNT` of them while
  the intro is up, **zero** after it unmounts, and zero under reduced motion.
  Any survivor is a layer that has escaped `.intro`, and it will be running
  behind the page for the rest of the visit.
- **The film and the rings share a centre.** Sample `.mask` and any `.ring`
  mid-intro and compare the two boxes' vertical centres: they must agree to
  the pixel, on a phone as much as on a desktop. This is the one that got away
  before — the rings were centred on the screen while the film was centred in
  the room between the bar and the buttons, which is a 22px error on a desktop
  and a 79px error on a phone. It costs nothing to check and a screenshot at
  the wrong second will not show it.
- **The room holds still off screen.** Scroll past the hero and read
  `animation-play-state` on a band: it should be `paused`, and `running`
  again on the way back up. Query it by `[data-row]` — a `[class*="band"]`
  selector matches the container first, which has no animation and will
  report `running` forever.

`next start` snapshots `/public` at build time, and it holds its build
manifest in memory — deleting `.next` under a running server leaves it
serving HTML that points at chunks no longer on disk, which shows up as a
500 and a MIME-type refusal rather than as anything to do with the page.
Stop the server by pid before rebuilding.
