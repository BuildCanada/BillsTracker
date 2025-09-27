import type { NextConfig } from "next";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/bills";

const nextConfig: NextConfig = {
  basePath: "/bills",
  assetPrefix: BASE_PATH,

  /* config options here */
  output: "standalone",

  // Ensure incoming requests scoped under BASE_PATH resolve to root routes
  async rewrites() {
    return [
      {
        source: `${BASE_PATH}`,
        destination: "/",
      },
      {
        source: `${BASE_PATH}/:path*`,
        destination: "/:path*",
      },
    ];
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "react-markdown"],
  },

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
