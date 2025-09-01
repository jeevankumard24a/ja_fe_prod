import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: [
        "jalgo.ai",
        "www.jalgo.ai",
        "*.jalgo.ai",
        "localhost:3001",
        "3.111.162.20:3001",
    ],
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

};

export default nextConfig;