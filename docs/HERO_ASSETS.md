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

Because the film is scrubbed rather than played, the browser needs it
buffered. It starts downloading on the first scroll, wheel, touch or pointer
event, with a 1.2s fallback.

## Atmosphere

None of this is in the footage; it is drawn over it so it keeps moving even
when the film is frozen.

- **Spice dust** — `components/ui/SpiceDust.tsx`, a canvas field of warm
  motes. The hero runs two: a dense layer behind the type and a sparse,
  dimmer one in front, so motes pass on both sides of the headline. The
  wheel shoves the field and the shove decays over about a second. The loop
  stops when the hero is off screen or the tab is hidden, and reduced motion
  gets one still frame.
- **Steam** — three blurred plumes rising on a CSS loop, never scroll-bound.
  This is what stops a paused scroll from looking like a stalled video.
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
build time: a committed file under `public/assets/hero` wins, anything
missing streams straight from the CDN. The hero is therefore complete on
the very first deploy.

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
