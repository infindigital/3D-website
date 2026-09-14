import type { NextConfig } from "next";

/**
 * Two targets, one codebase.
 *
 * The default build is the Node one Vercel runs: image optimization on,
 * response headers served by Next itself.
 *
 * `STATIC_EXPORT=1 npm run build` produces `out/` instead — a folder of
 * plain HTML, CSS, JS and assets for Apache shared hosting, where there is
 * no Node process to optimize an image or add a header at request time. The
 * two differences below are forced by that, not chosen, and the headers
 * Next would have sent are reissued by the .htaccess shipped alongside.
 *
 * Everything that makes this site move — three.js, React Three Fiber, GSAP,
 * Lenis, Framer Motion — runs in the browser and is unaffected by which of
 * the two builds produced the page.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport ? { output: "export" as const } : {}),
  images: isStaticExport
    ? {
        /* No server, so no /_next/image endpoint to resize through. Every
           image is already a committed .webp at its display size, so this
           costs the responsive srcset and nothing else. */
        unoptimized: true,
      }
    : {
        formats: ["image/avif", "image/webp"],
        // Every image on the site is a committed file under /public; nothing is
        // fetched from a third-party host, so no remote patterns are allowed.
      },
  // Three.js and drei ship large ES modules; this keeps bundles lean.
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
  /* Omitted entirely in an export: Next warns that headers() cannot be
     honoured without a server, and it is right. public/.htaccess carries
     the same rules across for Apache. */
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
              ],
            },
            {
              // Artwork and textures change rarely; a day fresh plus a week of
              // stale-while-revalidate keeps them fast without risking staleness
              // if the owner ever swaps a file under the same name.
              source: "/assets/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=86400, stale-while-revalidate=604800",
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
