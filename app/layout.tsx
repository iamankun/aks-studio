import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ClientWrapper } from "@/components/client-wrapper"
import { ErrorBoundary } from "@/components/error-boundary"
import { Dosis } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

const dosis = Dosis({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-dosis",
})

export const metadata: Metadata = {
  title: "AKs Studio - Dashboard",
  description: "Nền tảng quản lý và phát hành âm nhạc dành cho giới trẻ",
  icons: {
    icon: "/face.png",
  },
  generator: "ankun.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={dosis.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ErrorBoundary>
          <ClientWrapper>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Đang tải...</p>
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </ClientWrapper>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
