import type { NextConfig } from "next";

// Static export for GitHub Pages (https://zaidimurtaza.github.io).
// The chat agent runs separately as a Cloudflare Worker (see /worker), so the site needs no server.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true }, // Pages has no image optimizer; assets are already small WebP/JPEG
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
