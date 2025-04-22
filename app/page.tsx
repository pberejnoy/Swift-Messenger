import PublicHeader from "@/components/public-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-gradient-to-b from-white to-swift-primary/10 dark:from-swift-accent dark:to-swift-accent/80">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="mb-4">
                <Image
                  src="/swift_main_logo.png"
                  alt="Swift Messenger"
                  width={120}
                  height={120}
                  className="swift-logo-hover"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-swift-accent dark:text-white">
                  Swift Messenger
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-300">
                  Connect with your team in real-time. Simple, fast, and secure messaging for everyone.
                </p>
              </div>
              <div className="space-x-4 mt-8">
                <Button asChild className="bg-swift-primary hover:bg-swift-primary/90 text-white">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-swift-primary text-swift-primary hover:bg-swift-primary/10 dark:border-white dark:text-white"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
