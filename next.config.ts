import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Every image on the site is a committed file under /public; nothing is
    // fetched from a third-party host, so no remote patterns are allowed.
  },
  // Three.js and drei ship large ES modules; this keeps bundles lean.
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
};

export default nextConfig;
