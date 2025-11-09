/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack configuration (Next 16 default bundler)
  turbopack: {
    // Silence workspace root inference warning by explicitly setting the root
    root: __dirname,
  },
}

module.exports = nextConfig

