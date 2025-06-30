import type { Metadata } from "next"
import React from "react"
import { Dosis } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { MainContentLayout } from "@/components/main-content-layout"
import { DynamicBackground } from "@/components/dynamic-background"
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
        <link rel="icon" href="/face.png" />
      </head>
      <body className={dosis.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <DynamicBackground />
            <MainContentLayout>
              {children}
            </MainContentLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}