import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
    },
    output: 'standalone',
};

export default nextConfig;
