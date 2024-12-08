/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: process.env.IMAGE_CLOUD_FRONT_HOST || "",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
