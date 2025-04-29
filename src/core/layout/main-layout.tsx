import type { ReactNode } from "react"
import { Navbar } from "@/src/core/layout/navbar"
import { Footer } from "@/src/core/layout/footer"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
