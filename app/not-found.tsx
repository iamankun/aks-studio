export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-900">
      {/* Video Background */}
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-20">
        <source src="/videos/error-bg.mp4" type="video/mp4" />
        <source src="/videos/error-bg.webm" type="video/webm" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white font-dosis">
        <h1 className="text-9xl font-bold text-purple-500 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Trang không tồn tại</h2>
        <p className="text-gray-300 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  )
}
