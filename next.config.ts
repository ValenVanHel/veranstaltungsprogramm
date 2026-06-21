import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.2.53", "192.168.2.53:3000"]
};

export default nextConfig;
