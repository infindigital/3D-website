import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Three.js and drei ship large ES modules; this keeps bundles lean.
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
};

export default nextConfig;
