/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify部署配置
  images: {
    domains: [],
    unoptimized: true,
  },
  // 使用默认构建模式以支持API路由
  // output: 'export', // 注释掉以支持API路由
  trailingSlash: false,
}

module.exports = nextConfig