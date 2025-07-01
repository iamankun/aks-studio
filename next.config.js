/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bật chế độ nghiêm ngặt của React để phát hiện lỗi sớm
  reactStrictMode: true,

  // Cấu hình các package bên ngoài cho server components
  // (Dùng cho database và các thư viện không tương thích với React Server Components)
  serverExternalPackages: ['@neondatabase/serverless'],

  // Cấu hình hình ảnh - cho phép các domain bên ngoài
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Cấu hình thử nghiệm (experimental features)
  experimental: {
    // Cho phép các domain được truy cập trong môi trường development
    // (Đã bị loại bỏ trong Next.js 15, không cần thiết nữa)
    // allowedDevOrigins: [...] - Đã xóa vì không còn hỗ trợ
  },
}

module.exports = nextConfig
