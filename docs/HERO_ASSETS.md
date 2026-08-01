# Hero film — "A Feast in Motion"

The hero plays one continuous shot of the signature dishes, generated with
Higgsfield on 2026-08-01: a premium black plate of Gobi Manchurian, Fish Fry,
Chicken 65 and Masala Chicken on a charcoal ground, the camera pushing in
before the food bursts upward and hangs in zero gravity while the lens flies
through it.

Everything here is dish scenery and texture only. Package artwork and the
brand logo are supplied by the owner and are never generated.

## Scrolling is the projector

The scroll position *is* the film's playhead, not a trigger for it. Stop
scrolling and the food freezes mid-air; scroll back and every ingredient
returns to the plate exactly as it left.

| Scroll | Scene | Playhead |
| ------ | ----- | -------- |
| 0–20% | Arrival. The plate rests, the camera creeps in. | 0 → 1.8s |
| 20–50% | Explosion. The food leaves the plate and separates. | 1.8 → 5.2s |
| 50–75% | Rotation. The camera flies through the floating ingredients. | 5.2 → 10s |
| 75–100% | Rebuild. Everything falls back and lands. | 10 → 1.8s |

The last quarter runs the film **backwards**. The reverse of an explosion is
a perfect landing, so nothing has to be animated twice and every piece
returns to precisely where it started, settling on the pushed-in plate rather
than the wide opening frame.

The copy is keyed to the same progress: the scene-one title card steps aside
as the plate comes apart, the subheadline steps back for the macro shots so
the food can fill the screen, and the logo lockup lands with the dish.

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

## Getting the film scrubbable

Scrubbing needs random access to the whole file, and streaming cannot give
it: every seek becomes a range request, and a scroll asks for them far
faster than the network can answer, so the picture sticks on whichever frame
arrived last. Three things in `Hero.tsx` prevent that, and all three matter.

- **The file is downloaded once, not streamed.** It is fetched into a blob
  on the first scroll, wheel, touch or pointer event (with a 0.5s fallback)
  and the element is handed the object URL, after which every seek is local.
  This is why the film is never fetched from the CDN directly: Higgsfield's
  CDN sends no CORS headers, so a cross-origin `fetch` of it dies in the
  browser and the hero silently degrades to unscrubbable streaming — which
  is exactly "the video doesn't load when I scroll". Instead
  `src/app/api/hero-film/route.ts` proxies the film through this site's own
  origin (CORS does not bind server-to-server requests), so the blob fetch
  is same-origin and works everywhere. If the fetch still fails, or the
  file is heavier than 28MB, the element streams from the same route, and
  the seek loop clamps to the buffered end so the scrub follows the
  downloaded footage instead of freezing.
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
  one dark stretch of the site ends on a dissolve instead of a cut.

## The navigation over a dark hero

The floating bar switches to dark glass while a section marked
`data-dark-section="true"` covers the band it sits in. The hero sets that
attribute on mount and clears it just before the closing wash turns the stage
cream underneath the bar, so the switch back happens on its own. Any future
dark section can opt in the same way.

## Ambient sound (optional, not supplied)

The hero renders a mute/unmute toggle **only** if
`public/assets/hero/ambience.mp3` exists, and never plays it unprompted — the
toggle is the consent. No such file ships: Higgsfield's audio models generate
speech only, so a sizzle or restaurant-ambience loop has to be owner-supplied
or licensed. Drop one in at that path and the toggle appears by itself.

## Streaming fallback (no action needed to go live)

The site does not wait for these files. `src/config/heroMedia.ts` holds the
public CDN URL of every hero asset, and the home page resolves each one at
build time: a committed file under `public/assets/hero` wins. Anything
missing is served through this site's own origin instead of the CDN — the
film via `/api/hero-film`, the poster via `next/image` — because the CDN
sends no CORS headers and the film has to be fetchable to be scrubbable.
The hero is therefore complete on the very first deploy.

## Self-hosting the files (recommended eventually)

Serving from your own domain avoids a third-party dependency and gives the
scrub a faster, range-request friendly source. On any machine with access to
`d8j0ntlcm91z4.cloudfront.net` (Higgsfield's CDN), run from the repo root:

```bash
node scripts/fetch-hero-assets.mjs
```

Commit the downloaded files afterwards; the next build picks them up
automatically and stops using the CDN.

## Asset map

| File | Purpose | Source |
| ---- | ------- | ------ |
| `public/assets/hero/hero-loop.mp4` | The hero film, scrubbed by scroll. 1920×1080, 10s, silent | Kling 3.0 (pro) job `ce158ce6`, from still `5718f989` |
| `public/assets/hero/hero-poster.webp` | Poster frame, and the still shown on phones and with reduced motion. Identical to the film's first frame | Nano Banana Pro job `5718f989` |
| `public/assets/hero/ambience.mp3` | Optional ambient sizzle. Owner-supplied; the sound toggle only appears when this exists | not generated |
| `public/assets/textures/ingredients-scatter.png` | Scattered ingredients, reserved for the brand story section | job `0f7f323e` |
| `public/assets/textures/spice-dust.webp` | Powder swirl texture, reserved for section transitions | job `ceb80041` |

The hero resolves these at build time and falls back to the CDN for any that
are missing, so the site builds and runs either way.

### A second take of the film

Both takes came from the same start frame and prompt. The alternate is
exported as `heroFilmAlternate` in `src/config/heroMedia.ts` and referenced
nowhere; if it reads better on a big screen, swap it into `video` there (and
into `scripts/fetch-hero-assets.mjs`) — job `3c93a0af`.

**The machine that generated these could not reach the CDN to play them
back, so neither take has been watched.** The scroll choreography was
verified end to end against a synthetic timecoded film; the footage itself
still needs a human review before launch.
