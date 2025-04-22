import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SwiftLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  withText?: boolean
  className?: string
  linkTo?: string
}

export function SwiftLogo({ size = "md", withText = true, className, linkTo }: SwiftLogoProps) {
  const sizeMap = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  }

  const logoSize = sizeMap[size]
  const textSize = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : size === "lg" ? "text-2xl" : "text-3xl"

  // Default link to channels/general for authenticated users
  const defaultLink = "/channels/general"

  const logo = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="swift-logo-hover relative">
        <Image
          src="/swift_main_logo.png"
          alt="Swift Messenger"
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority
        />
      </div>
      {withText && <span className={cn("font-bold text-swift-accent dark:text-white", textSize)}>Swift</span>}
    </div>
  )

  if (linkTo) {
    return <Link href={linkTo}>{logo}</Link>
  }

  // If no linkTo is provided, default to the channels page
  return <Link href={defaultLink}>{logo}</Link>
}
