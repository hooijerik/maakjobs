import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Company logos are loaded as plain <img> from external favicon services,
  // so we don't need next/image remotePatterns. Keep config minimal.
  outputFileTracingIncludes: {
    // Ensure the SQLite DB ships with the server bundle when self-hosting.
    "/**": ["./data/*.db"],
  },
};

export default nextConfig;
