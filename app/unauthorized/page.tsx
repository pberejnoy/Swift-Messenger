import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Access Denied</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">You don't have permission to access this page.</p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
