import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthSafeErrorBoundary } from "@/components/auth-safe-error-boundary"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Swift Messenger",
  description: "A modern messaging application",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthSafeErrorBoundary>
            <AuthProvider>{children}</AuthProvider>
          </AuthSafeErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
