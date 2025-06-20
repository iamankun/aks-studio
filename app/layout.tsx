import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { ClientWrapper } from "@/components/client-wrapper"
import { Dosis } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

// Initialize the Dosis font with proper subsets
const dosis = Dosis({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-dosis",
})

export const metadata: Metadata = {
  title: "[tenapp] - Digital Music Distribution",
  description: "Nền tảng quản lý và phát hành âm nhạc chuyên nghiệp",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${dosis.variable}`}>
      <body className="font-dosis">
        <ClientWrapper>{children}</ClientWrapper>
                <Analytics />
      </body>
    </html>
  )
}
