/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: process.env.CLOUD_FRONT_DOMAIN_PROFILE || "",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
