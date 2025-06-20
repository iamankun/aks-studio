// Tôi là An Kun
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: [
      'http://aks.ankun.dev',
      'http://*.aks.ankun.dev', // Sửa lại wildcard nếu ý định là subdomain
      'http://192.168.1.4:*', // Thêm IP của máy phát triển
      'http://localhost:*', // Thêm localhost nếu bạn cũng truy cập qua đó
    ],
  }
}

export default nextConfig