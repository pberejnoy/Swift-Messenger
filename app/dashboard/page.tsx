"use client"

import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { useSession } from "@/src/contexts/session-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/src/core/routing/routes"
import Link from "next/link"
import { MessageSquare, Users, Settings, Shield } from "lucide-react"

export default function DashboardPage() {
  const { user, isAdmin, signOut } = useSession()

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={signOut} variant="outline">
            Sign out
          </Button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.user_metadata?.username || user?.email}</h2>
          <p className="text-muted-foreground">
            You are now signed in to Swift Messenger. Use the cards below to navigate to different sections of the
            application.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Channels
              </CardTitle>
              <CardDescription>Join public channels and collaborate with your team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Channels are where your team communicates. They're best when organized around a topic — #marketing, for
                example.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={routes.messages}>Browse Channels</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Direct Messages
              </CardTitle>
              <CardDescription>Private conversations with team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Direct messages are private conversations between you and another person or a small group.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={routes.directMessages}>Start Conversation</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Settings
              </CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your profile, change your password, and manage your notification preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href={routes.settings}>Account Settings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {isAdmin && (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-primary/20">
            <h2 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
              <Shield className="h-5 w-5" /> Admin Access
            </h2>
            <p className="text-muted-foreground mb-4">
              You have administrator privileges. You can access the admin panel to manage users, channels, and system
              settings.
            </p>
            <Button asChild>
              <Link href={routes.admin.dashboard}>Access Admin Panel</Link>
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
