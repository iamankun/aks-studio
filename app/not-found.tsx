import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, FileSearch } from "lucide-react"
import { DynamicBackground } from "@/components/dynamic-background"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 relative flex items-center justify-center">
      <DynamicBackground />
      <div className="relative z-10 text-center text-white max-w-md mx-auto p-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <FileSearch className="h-20 w-20 text-purple-400" />
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              404
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Không tìm thấy trang</h1>
        <p className="text-gray-300 mb-6">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Trở về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
