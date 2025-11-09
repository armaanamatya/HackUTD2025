/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mark server-side packages that shouldn't be bundled
  // pdf-parse v1.1.1 works better when externalized to avoid webpack bundling issues
  serverComponentsExternalPackages: ['pdf-parse'],
}

module.exports = nextConfig

