import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "s3.ap-south-1.amazonaws.com",
                pathname: "/com.pa.images.1/**",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
    allowedDevOrigins: ['https://jalgo.ai','localhost:3001','3.111.162.20:3001','local-origin.dev', '*.local-origin.dev'],

};

export default nextConfig;