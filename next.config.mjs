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
}


// ... các cấu hình khác của bạn
experimental: {
  // Thêm allowedDevOrigins vào mục experimental
  allowedDevOrigins: [
    'http://192.168.1.100:3000', // Ví dụ: địa chỉ IP cục bộ
    'http://my-dev-domain.local:3000', // Ví dụ: tên miền tùy chỉnh
    // Thêm các nguồn gốc khác nếu cần
  ],
  },
};

module.exports = nextConfig;
