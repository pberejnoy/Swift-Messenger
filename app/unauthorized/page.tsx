import Link from "next/link"
import { Button } from "@/components/ui/button"
import { routes } from "@/src/core/routing/routes"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Please contact an administrator if you believe this is an
          error.
        </p>
        <Button asChild>
          <Link href={routes.dashboard}>Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
