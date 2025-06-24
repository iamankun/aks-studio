/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: ["https://aks.ankun.dev", "https://*.aks.ankun.dev", "https://aksstudio.vercel.app"], // Thay thế bằng IP và cổng thực tế của bạn
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
