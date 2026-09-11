import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray lockfiles in parent folders are ignored.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    // Local escape hatch for networks whose HTTPS proxy Node doesn't trust (the optimizer
    // then fails to fetch Unsplash). Off by default; never set it in production.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
  },
};

export default nextConfig;
