import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ChannelDiagnosticLink() {
  return (
    <div className="text-center mt-2 mb-2">
      <Button variant="ghost" size="sm" asChild className="text-xs text-gray-400 hover:text-gray-300">
        <Link href="/diagnostic/channels" className="flex items-center">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Channel Issues?
        </Link>
      </Button>
    </div>
  )
}
