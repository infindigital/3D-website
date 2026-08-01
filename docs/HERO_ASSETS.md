# Hero film

The hero plays `public/assets/home/kitchen-film.mp4` — the owner's ten-second
kitchen film, shot with the real packets. It is the same file the 3D world
below the hero is built from, cut differently: the hero runs the whole ten
seconds once, the world takes six shots out of it and holds each one on a
screen standing in the corridor (see [HOME_WORLD.md](./HOME_WORLD.md)).

One film, one download, one decoder warm by the time the world starts.

Package artwork and the brand logo are owner-supplied and are never
generated. So is the film. Nothing on this page comes from a third-party
host — `next.config.ts` declares no `remotePatterns`, and there is no CDN
fallback to fail over to, because there is nothing to fall back from.

## Scrolling is the projector

The scroll position *is* the film's playhead, not a trigger for it. Stop
scrolling and the toss freezes mid-air; scroll back and the masala goes back
into the sachet.

| Scroll | Scene | Playhead |
| ------ | ----- | -------- |
| 0–20% | The toss. Florets and chilli hanging over the plate. | 0 → 2.35s |
| 20–50% | The hands. The sachet opens, the masala goes on. | 2.35 → 5.5s |
| 50–75% | Into the oil, and the fry. | 5.5 → 7.45s |
| 75–100% | Plated, then both packs behind both plates. | 7.45 → 10s |

The four boundaries are **the cuts in the footage**. That is the whole reason
they sit where they do: a scene of the storyboard must never straddle a cut,
or the scrub lands on a frame belonging to the next shot and the copy is
captioning the wrong picture.

It runs forward, all the way through, and lands on the packs — the film's own
last shot arrives exactly as the sign-off card fades up over it. An earlier
version of this hero ran its last leg backwards, which is free with a
generated explosion (the reverse of one is a perfect landing) and wrong with
real kitchen footage: hands un-pouring masala reads as a video played in
reverse, because it is one.

The copy is keyed to the same progress: the title card steps aside as the
sachet opens, the subheadline steps back for the fry so the food can fill the
screen, and the logo lockup lands with the plated dish.

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
size: it fades in over its own poster and picks up the playhead, and nothing
on screen moves to accommodate it. The poster alone already carries the
dolly, the vignette and every copy beat, so the hero is never a dead stretch
of scrolling while the video downloads.

`public/assets/hero/hero-poster.webp` is the film's own frame 0, pulled
straight out of the mp4. That is not a nicety: the still and the video are
registered to the same pixel, so the dissolve between them has nothing to
give away.

## Getting the film scrubbable

Scrubbing needs random access to the whole file, and streaming cannot give
it: every seek becomes a range request, and a scroll asks for them far
faster than the network can answer, so the picture sticks on whichever frame
arrived last. Three things in `Hero.tsx` prevent that, and all three matter.

- **The file is downloaded once, not streamed.** It is fetched into a blob
  on the first scroll, wheel, touch or pointer event (with a 0.5s fallback)
  and the element is handed the object URL, after which every seek is local.
  This is why the film has to be **same-origin**: a cross-origin host that
  sends no CORS headers kills the blob fetch in the browser and the hero
  silently degrades to unscrubbable streaming — which is exactly "the video
  doesn't load when I scroll". It is served from `/public`, so this holds by
  construction. If the fetch still fails, or the file is heavier than 28MB,
  the element streams from the same path and the seek loop clamps to the
  buffered end, so the scrub follows the downloaded footage instead of
  freezing.
- **The playhead is handed over on `canplaythrough`**, or once `buffered`
  covers the duration — not on `loadeddata`, which only means a first frame
  turned up.
- **Only one seek is ever in flight.** The scroll writes a target; a
  separate frame loop eases toward it and assigns `currentTime` only when
  the previous seek has finished. The easing is also what turns a scrubbed
  file into a camera move rather than something that tracks the wheel notch
  for notch.

Safari additionally refuses to seek a video that has never played, so the
element is played and paused once on `loadedmetadata` while it is still
muted and showing frame zero.

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
| `public/assets/home/kitchen-film.mp4` | The film. Scrubbed by the hero, cut into six segments by the world. 1280×720, 10s, silent | owner-supplied |
| `public/assets/hero/hero-poster.webp` | The hero's poster, and the still shown on phones and with reduced motion. The film's own frame 0 | pulled from the film |
| `public/assets/home/kitchen-film-poster.webp` | Poster for the flat layout's ordinary `<video>`. A frame from 9.35s | pulled from the film |
| `public/assets/hero/ambience.mp3` | Optional ambient sizzle. Owner-supplied; the sound toggle only appears when this exists | not supplied |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | generated |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | generated |

## Verifying a change

Headless Chromium ships without H.264, so the mp4 has to be intercepted and
served as WebM for a harness run. Redirect that interception at a **static
file** (`route.continue({url})`), never `route.fulfill` with a buffer: a
fulfilled response carries no `Accept-Ranges`, the element reports the film
as unseekable, every seek is silently clamped to zero, and the hero sits on
frame one while looking, at a glance, like it is working.

The hero's blob fetch is armed by a user gesture, so nudge the wheel before
probing, then check `video.src` starts with `blob:` — if it still points at
the mp4, you are measuring the streaming fallback, not the scrub.
