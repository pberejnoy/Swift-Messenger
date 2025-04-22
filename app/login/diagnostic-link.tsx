import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function DiagnosticLink() {
  return (
    <div className="text-center mt-4 mb-4">
      <p className="text-sm text-gray-500 mb-2">Having trouble logging in?</p>
      <div className="flex justify-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/diagnostic" className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Run Login Diagnostic
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/help/login" className="flex items-center">
            Help Guide
          </Link>
        </Button>
      </div>
    </div>
  )
}
