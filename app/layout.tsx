import type { Metadata } from "next"
import { Dosis } from "next/font/google"
import { RootLayoutClient } from "@/components/root-layout-client"
import "./globals.css"
import "./additional-styles.css"

const dosis = Dosis({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
})

export const metadata: Metadata = {
  title: "AKs Studio - Digital Music Distribution",
  description: "Professional music distribution platform for independent artists and labels",
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/media.webp" />
      </head>
      <RootLayoutClient className={dosis.className}>
        {children}
      </RootLayoutClient>
    </html>
  )
}