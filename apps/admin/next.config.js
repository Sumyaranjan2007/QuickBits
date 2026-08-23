/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@quickbite/types',
    '@quickbite/config',
    '@quickbite/validation',
    '@quickbite/api-client',
    '@quickbite/ui'
  ],
};

module.exports = nextConfig;
