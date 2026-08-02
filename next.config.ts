import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // This repository sits below another lockfile; pin the real application root so
  // Turbopack does not watch or resolve against the parent workspace by mistake.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
