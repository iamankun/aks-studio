/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: ['http://192.168.1.11:3000', 'http://localhost:3000'] // Thay thế bằng IP và cổng thực tế của bạn
  },
};
module.exports = nextConfig;
