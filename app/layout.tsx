import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { ClientWrapper } from "@/components/client-wrapper"
import { Dosis } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
// Initialize the Dosis font with proper subsets
const dosis = Dosis({
  subsets: ["latin", "latin-ext", "vietnamese"], // Added vietnamese and latin-ext for broader character support
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-dosis", // This creates the CSS variable for Dosis
})

export const metadata: Metadata = {
  title: "AKs Studio - Dashboard", // Đã thay đổi thành giá trị tĩnh
  description: "Nền tảng quản lý và phát hành âm nhạc dành cho giới trẻ",
  icons: {
    icon: "/public/face.png",
  },
  generator: "ankun.dev",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={dosis.variable}>
        <ClientWrapper>{children}</ClientWrapper>
        <Analytics />
      </body>
    </html>
  )
}
