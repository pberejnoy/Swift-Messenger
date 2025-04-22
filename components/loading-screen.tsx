import { Loader2 } from "lucide-react"
import { SwiftLogo } from "./swift-logo"

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-b from-white to-swift-primary/10 dark:from-swift-accent dark:to-swift-accent/80">
      <div className="flex flex-col items-center">
        <SwiftLogo size="xl" />
        <Loader2 className="h-12 w-12 animate-spin text-swift-primary mt-6" />
        <h2 className="mt-4 text-xl font-semibold text-swift-accent dark:text-white">Loading...</h2>
      </div>
    </div>
  )
}
