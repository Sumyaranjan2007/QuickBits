/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  transpilePackages: [
    '@quickbite/types',
    '@quickbite/config',
    '@quickbite/validation',
    '@quickbite/api-client',
    '@quickbite/ui'
  ],
};

module.exports = nextConfig;

