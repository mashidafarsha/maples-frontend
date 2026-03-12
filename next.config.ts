import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.22:3000", "localhost:3000"],
    },
  },
  // Cloudinary ഇമേജുകൾ അനുവദിക്കാൻ താഴെ പറയുന്ന വരികൾ ചേർത്തു
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;