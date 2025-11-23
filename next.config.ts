import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serverless function runtime 설정
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas'],
  },
};

export default nextConfig;
