import { heroMediaRemote } from "@/config/heroMedia";

/**
 * Same-origin gateway for the hero film.
 *
 * The Higgsfield CDN answers without any CORS headers, so the browser's
 * `fetch()` of the film — the step that makes it scrubbable — is blocked
 * whenever the page asks the CDN directly, and the hero silently degrades
 * to a stream that cannot keep up with a scroll. CORS is a browser rule,
 * not a server one, so this route pulls the film server-side and hands it
 * on. To the browser the film is now same-origin, the blob fetch works
 * everywhere, and the CDN URL never has to change.
 *
 * Range requests pass straight through, so the `<video>` element can also
 * stream from here in the fallback path. Responses are marked immutable
 * because the CDN filenames are content-hashed: a new take is a new URL.
 *
 * A committed public/assets/hero/hero-loop.mp4 still wins outright — when
 * it exists, page.tsx points the hero at the file and nothing calls this.
 */
export const dynamic = "force-dynamic";

const PASSTHROUGH = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
] as const;

export async function GET(request: Request) {
  const range = request.headers.get("range");

  let upstream: Response;
  try {
    upstream = await fetch(heroMediaRemote.video, {
      headers: range ? { range } : undefined,
      cache: "no-store",
    });
  } catch {
    return new Response("hero film upstream unreachable", { status: 502 });
  }

  if (!(upstream.ok || upstream.status === 206) || !upstream.body) {
    return new Response("hero film upstream error", { status: 502 });
  }

  const headers = new Headers();
  for (const name of PASSTHROUGH) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(upstream.body, { status: upstream.status, headers });
}
