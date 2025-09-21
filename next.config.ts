import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-markdown'],
  },

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
