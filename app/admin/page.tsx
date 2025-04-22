import { requireAdmin, getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboardPage() {
  // This will redirect if not an admin
  await requireAdmin()
  const currentUser = await getCurrentUser()

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Management</CardTitle>
            <CardDescription>Manage all channels and messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/channels">
              <Button className="w-full">Manage Channels</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings">
              <Button className="w-full">System Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Name:</strong> {currentUser?.name}
            </p>
            <p>
              <strong>Email:</strong> {currentUser?.email}
            </p>
            <p>
              <strong>Role:</strong> Super Admin
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
