# Hero film

The hero plays `public/assets/home/kitchen-film.mp4` — the owner's ten-second
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
opens on a sheet of restaurant orange with the film already running inside a
small organic shape, thin outline rings pushing outward past it. The shape
creeps, then opens out, and the orange collapses inward behind it until
there is none of it left — and what is standing there is the hero.

The whole of that is one element being grown. `Hero.tsx` holds the beats:

| Second | What happens |
| ------ | ------------ |
| 0.0 | Orange sheet, film small in the middle, rings rippling outward. |
| 0.8 | The shape starts to creep — slowly, so the open reads as a break. |
| 2.4 | It opens out to full size. |
| 2.5 | The orange starts collapsing into it. |
| 2.95 | The room is the hero's; the header is told it may come down. |
| 3.05 | The buttons rise into place. |
| 3.7 | Scroll is unlocked and everything the intro owned is unmounted. |

**The film lives in the hero, not in the intro.** An intro that owns its own
video has to hand over to a second one at the join, and a second one is a
second decoder, a second buffer and a visible jump. Here the intro only
*grows* the hero's own shape, so the frame playing at 0.0 is the frame
playing at 3.7 — "the video does not restart" is a structural fact rather
than two players being resynchronised.

**The orange collapses rather than fades.** `.wash` and `.rings` are clipped
to `circle(var(--wipe) at 50% 50%)`, and the timeline closes `--wipe` on the
centre. Everything still visible is the part of the sheet *outside* the
film; once the circle is smaller than the film there is no orange left. No
crossfade happens at any point, which is why there is no moment where two
pictures are on screen at half strength.

## The stylesheet is the finished hero; the script is the opening frame

`Hero.module.css` describes the **finished** hero and nothing else. The
intro's opening frame — small shape, buttons parked below their line — is
written by `gsap.set()` in a layout effect, before the browser has painted.

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
- **The shape** — an eight-value `border-radius` morphing on a 26s loop, so
  the film's outline is never the same twice and never an oval.
- **The picture** — a slow scale inside the shape, so it is never perfectly
  still.

`.shape` is the script's (the intro grows it) and `.shift` is the pointer's.
Keeping them on separate elements is why the growth and the parallax never
overwrite each other.

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
    public/assets/home/kitchen-film.mp4
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

The hero owns when the bar arrives. At `2.95s` it fires
`HERO_OPEN_EVENT` (`src/utils/heroOpen.ts`); `Navigation.tsx` listens on the
home page only, with `HERO_OPEN_FALLBACK_MS` behind it so a hero that never
mounts still cannot leave the site without navigation. Everywhere but the
home page the bar comes down immediately.

The bar is transparent at the top of every page and takes its glass only
once the page has moved.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/home/kitchen-film.mp4` | The film. Played whole by the hero, cut into six segments by the world. 1280×720, 10s, silent, 0.5s keyframes, ~1.6 MB | owner-supplied, re-encoded |
| `public/assets/hero/hero-poster.webp` | The hero's poster, and the whole picture under reduced motion. The film's own frame 0 | pulled from the film |
| `public/assets/home/kitchen-film-poster.webp` | Poster for the flat layout's ordinary `<video>`. Also frame 0 | pulled from the film |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | generated |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | generated |

Both posters are the film's own frame 0, pulled straight out of the mp4.
That is not a nicety: the still and the video are registered to the same
pixel, so the dissolve between them has nothing to give away. Re-pull them
whenever the film is re-encoded:

```
ffmpeg -i public/assets/home/kitchen-film.mp4 -frames:v 1 \
  -c:v libwebp -quality 84 public/assets/home/kitchen-film-poster.webp
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

`next start` snapshots `/public` at build time, and it holds its build
manifest in memory — deleting `.next` under a running server leaves it
serving HTML that points at chunks no longer on disk, which shows up as a
500 and a MIME-type refusal rather than as anything to do with the page.
Stop the server by pid before rebuilding.
