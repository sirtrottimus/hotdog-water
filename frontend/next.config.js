/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  env: {
    MONGO_URI: process.env.MONGODB_URI,
    PROD_API_URL: 'https://api.hatfilms.co.uk',
    DEV_API_URL: 'http://localhost:6969',
  },
};

export default nextConfig;
