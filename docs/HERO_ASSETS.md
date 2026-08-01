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

## The film plays; the scroll moves the room

The film runs on its own clock, muted and looping, from the moment it has a
frame to show. It is not scrubbed, and it is not waiting to be triggered: a
cooking film is a performance, and a wheel is not what should be performing
it — the toss hangs, the oil bubbles and the fry crisps at the speed they
were shot at, whether the page is moving or not.

The scroll still drives the hero, it just drives everything around the
footage. One number does it: the stage carries `--p`, the raw scroll
progress through the section, and `Hero.module.css` derives the dolly, the
vignette, the readability scrim and the closing wash from it, while the same
timeline hands the copy from one beat to the next.

| Scroll | What moves |
| ------ | ---------- |
| 0–14% | The opening card holds; the scroll cue fades. |
| 14–56% | The title card steps aside, the room walks forward. |
| 56–72% | The subheadline steps back so the food can fill the screen. |
| 72–95% | The copy lifts and the sign-off card fades up over the film. |
| 95–100% | The wash to cream, into the world below. |

The film pauses when the section leaves the viewport, and picks up again
when it comes back. A decoder running behind a page nobody is looking at is
a battery bill for a picture that is not on screen.

## Two layouts, decided by a media query

A media query in `Hero.module.css` decides the hero's shape, and `CINEMATIC`
in `Hero.tsx` repeats it verbatim to decide whether to build the scroll
timeline. **The two must stay in step.**

- `(min-width: 768px) and (prefers-reduced-motion: no-preference)` — the
  cinematic hero, several screens tall with a sticky stage.
- Anything else — one screen tall, the poster frame, every line of copy at
  once. No video is fetched at all.

Because the stylesheet alone decides this, the hero is in its final shape on
the first paint. The film then arrives into a stage that is already the right
size: it fades in over its own poster and starts running, and nothing on
screen moves to accommodate it. The poster alone already carries the
dolly, the vignette and every copy beat, so the hero is never a dead stretch
of scrolling while the video downloads.

`public/assets/hero/hero-poster.webp` is the film's own frame 0, pulled
straight out of the mp4. That is not a nicety: the still and the video are
registered to the same pixel, so the dissolve between them has nothing to
give away.

## Getting the film on screen

It is an ordinary muted, looping, autoplaying `<video>` served from
`/public`. There is no blob, no proxy and no fetch of our own, because
nothing here needs random access to the file: playing forward is exactly
what a stream is good at, and the browser starts as soon as it has enough
to go on.

Two details are deliberate.

- **The element is not mounted at first paint.** It arrives on the first
  scroll, wheel, touch or pointer event, with a half-second fallback so it
  always arrives — the poster is a priority image, and the opening second
  belongs to it and the fonts rather than to a video download.
- **The crossfade is armed on `loadeddata`, not `canplaythrough`.** The
  picture is only dissolving up over its own frame zero, so the moment
  there is a frame to show is the moment to show it. Waiting for the whole
  file would hold the still frame long after the film is moving underneath
  it.

An earlier version of this hero pulled the file into a blob and drove
`currentTime` from the scroll position. All of that is gone: the machinery
it needed — the same-origin blob fetch, the size cap, the single-seek-in-
flight loop, the Safari priming play/pause — existed only to make seeking
survivable, and nothing seeks any more.

## Depth

The stage is a space rather than a stack of flat layers. `.scene` carries a
`1200px` perspective; the film hangs deep inside it and the type sits at the
front, so the pointer turns the picture on two axes — near edge growing, far
edge shrinking, by projection rather than by script — while the words stay
still and sharp. The scroll then walks the film *forward* through that same
space instead of scaling it up, which is what a dolly actually is and what
keeps the near field moving ahead of the far field the whole way in.

## Atmosphere

None of this is in the footage; it is drawn over it so it keeps moving even
when the film is frozen.

- **Steam** — three blurred plumes rising on a CSS loop, never scroll-bound,
  drifting at a rate between the film's and the type's so it reads as the
  middle distance. This is what stops a paused scroll from looking like a
  stalled video.
- **Vignette and scrim** — both deepen with scroll progress. The scrim is a
  feathered pool of shade with a slight backdrop blur; it is the readability
  floor for the type, so the picture behind can go anywhere.
- **Closing wash** — the stage dissolves to cream over the last 5%, so the
  hero hands over to the world on a dissolve instead of a cut.

## The navigation over a dark hero

The floating bar switches to dark glass while a section marked
`data-dark-section="true"` covers the band it sits in. The hero sets that
attribute on mount and clears it just before the closing wash turns the stage
cream underneath the bar, so the switch back happens on its own. Any future
dark section can opt in the same way.

## Ambient sound (optional, not supplied)

The hero renders a mute/unmute toggle **only** if
`public/assets/hero/ambience.mp3` exists, and never plays it unprompted — the
toggle is the consent. No such file ships. Drop one in at that path and the
toggle appears by itself.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/home/kitchen-film.mp4` | The film. Played whole by the hero, cut into six segments by the world. 1280×720, 10s, silent | owner-supplied |
| `public/assets/hero/hero-poster.webp` | The hero's poster, and the still shown on phones and with reduced motion. The film's own frame 0 | pulled from the film |
| `public/assets/home/kitchen-film-poster.webp` | Poster for the flat layout's ordinary `<video>`. A frame from 9.35s | pulled from the film |
| `public/assets/hero/ambience.mp3` | Optional ambient sizzle. Owner-supplied; the sound toggle only appears when this exists | not supplied |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | generated |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | generated |

## Verifying a change

Headless Chromium ships without H.264, so the mp4 has to be intercepted and
served as WebM for a harness run. Redirect that interception at a **static
file** (`route.continue({url})`), never `route.fulfill` with a buffer: a
fulfilled response carries no `Accept-Ranges`, and the world's six screens
each cue their own segment by seeking, which a body served without ranges
silently clamps to zero.

The hero's element is mounted on a user gesture, so nudge the wheel before
probing. Then read `currentTime` at two stops far enough apart to tell the
two failure modes apart: a film that is genuinely playing gives different
times that wrap around ten seconds, while a frozen one repeats itself.
`paused` should be false anywhere inside the hero and true below it.

`next start` snapshots `/public` at build time, and it holds its build
manifest in memory — deleting `.next` under a running server leaves it
serving HTML that points at chunks no longer on disk, which shows up as a
500 and a MIME-type refusal rather than as anything to do with the page.
Stop the server by pid before rebuilding.
