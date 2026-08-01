# Deployment

The site is a standard Next.js App Router project and deploys to Vercel
with zero build configuration. Any other Node host that runs
`npm run build && npm run start` works too; the steps below assume Vercel.

## One-time setup on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in
   (a free Hobby account is enough to launch).
2. Import the GitHub repository `infindigital/3D-website`.
   Vercel detects Next.js automatically; keep the default build settings.
3. Before the first deploy, open the Environment Variables step and add,
   for Production, Preview and Development:

   | Variable | Value |
   | -------- | ----- |
   | `NEXT_PUBLIC_SITE_URL` | The final domain, for example `https://rschefz.com`. No trailing slash. Until a custom domain exists, use the `https://<project>.vercel.app` URL Vercel assigns. |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Country code + number, digits only (see docs/ENVIRONMENT.md). Leave empty until the number is ready; every "Buy on WhatsApp" button stays hidden while it is unset. |

4. Deploy. Every later push to the production branch redeploys
   automatically, and every other branch gets a preview URL.

Full variable reference: [docs/ENVIRONMENT.md](./ENVIRONMENT.md).
No other tokens or secrets are required to deploy.

## Custom domain

1. Vercel project > Settings > Domains > add `rschefz.com` (and `www`).
2. Point the domain's DNS at Vercel as instructed on that screen
   (an A record to Vercel's IP or a CNAME for `www`).
3. Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy so
   canonical URLs, Open Graph tags and the sitemap use it.

## Hero media

Nothing to do. Every image, texture and film the site plays is a committed
file under `public/`, served from your own origin — there is no CDN to
configure, no third-party media dependency, and `next.config.ts` allows no
remote image hosts at all.

The one file worth knowing about is `public/assets/home/kitchen-film.mp4`,
which both the hero and the 3D world play. It has to stay same-origin: the
hero downloads it into a blob so the scroll can scrub it, and a cross-origin
host without CORS headers would break that silently. Details:
[docs/HERO_ASSETS.md](./HERO_ASSETS.md).

## What is already production-ready

- SEO: per-page titles and descriptions, canonical URLs from
  `NEXT_PUBLIC_SITE_URL`, `robots.txt` and `sitemap.xml` generated at
  build time, Open Graph / Twitter card image at `/og-image.jpg`
  (composed from the owner's logo and pack artwork).
- Caching: package artwork and textures are served with a
  stale-while-revalidate cache policy; Next.js fingerprints and
  immutably caches its own JS/CSS automatically.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` on every response.
- Resilience: the 3D scenes require WebGL and full motion preference,
  and fall back to flat artwork otherwise; the WhatsApp button hides
  itself when the number is not configured; the hero video layer skips
  itself while the media files are absent.

## Post-deploy checklist

1. Open the production URL on a phone and a desktop; scroll each page
   end to end.
2. Share the URL in a WhatsApp chat and confirm the link preview shows
   the logo-and-packs card.
3. Search Console (optional): submit `https://<domain>/sitemap.xml`.
4. When the WhatsApp number is ready, set
   `NEXT_PUBLIC_WHATSAPP_NUMBER` in Vercel and redeploy; the buy
   buttons appear everywhere automatically.
