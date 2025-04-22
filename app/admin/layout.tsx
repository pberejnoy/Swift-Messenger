import type React from "react"
import { getCurrentUser, requireAdmin } from "@/lib/auth"
import Link from "next/link"
import { Home, Users, MessageSquare, Settings } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect if not an admin
  await requireAdmin()
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400">Logged in as {user?.name}</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="flex items-center p-2 rounded hover:bg-gray-800">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="flex items-center p-2 rounded hover:bg-gray-800">
                <Users className="mr-2 h-5 w-5" />
                Users
              </Link>
            </li>
            <li>
              <Link href="/admin/channels" className="flex items-center p-2 rounded hover:bg-gray-800">
                <MessageSquare className="mr-2 h-5 w-5" />
                Channels
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center p-2 rounded hover:bg-gray-800">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Link>
            </li>
            <li className="pt-6">
              <Link href="/" className="flex items-center p-2 rounded hover:bg-gray-800">
                <Home className="mr-2 h-5 w-5" />
                Back to App
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800">{children}</div>
    </div>
  )
}
