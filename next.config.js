/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 14, no need for experimental flag
  images: {
    domains: [],
    unoptimized: true, // Required for static export
  },
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  // Disable image optimization for static export
  distDir: 'out',
}

module.exports = nextConfig