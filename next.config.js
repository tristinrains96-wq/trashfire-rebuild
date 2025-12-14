/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is stable in Next.js 14
  webpack: (config, { dev }) => {
    // Mitigate dev cache corruption on network/virtual drives (e.g., OneDrive)
    if (dev) {
      config.cache = { type: 'memory' }
    }
    return config
  },
}

module.exports = nextConfig
