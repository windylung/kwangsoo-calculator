import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serverless function runtime 설정
  serverExternalPackages: ['@napi-rs/canvas'],
};

export default nextConfig;
