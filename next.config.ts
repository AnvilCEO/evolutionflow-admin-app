import type { NextConfig } from "next";

function normalizeApiOrigin(raw?: string): string {
  const fallback = "https://evolutionflow-dev-api.vercel.app/api";
  const origin = raw && raw.trim().length > 0 ? raw : fallback;
  return origin.replace(/\/+$/, "");
}

const backendApiOrigin = normalizeApiOrigin(
  process.env.BACKEND_API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL,
);

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
