/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // External packages configuration for webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark server-side packages that shouldn't be bundled
      config.externals.push('pdf-parse')
    }
    return config
  },
}

module.exports = nextConfig

