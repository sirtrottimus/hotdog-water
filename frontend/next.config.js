/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  env:{
    NEXT_PUBLIC_VERSION: '1.6.1',
  }
};

export default nextConfig;
