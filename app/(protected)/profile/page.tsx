"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, AlertCircle } from "lucide-react"
import LoadingScreen from "@/components/loading-screen"
import { useMessaging } from "@/contexts/messaging-context"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SidebarNav } from "@/components/sidebar-nav"

export default function ProfilePage() {
  const { currentUser, isLoading, updateProfile } = useAuth()
  const { toast } = useToast()
  const { channels } = useMessaging()
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [status, setStatus] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user's channels
  const userChannels = channels.filter((channel) => channel.members && channel.members.includes(currentUser?.id || ""))

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "")
      setBio(currentUser.bio || "")
      setStatus(currentUser.status || "online")
    }
  }, [currentUser])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      await updateProfile({
        displayName,
        bio,
        status,
      })

      setIsSuccess(true)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("Failed to update profile. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  // Navigation items for the sidebar
  const sidebarNavItems = [
    {
      title: "Profile",
      href: "/profile",
    },
    {
      title: "Account",
      href: "/settings",
    },
    {
      title: "Appearance",
      href: "/settings?tab=appearance",
    },
    {
      title: "Notifications",
      href: "/settings?tab=notifications",
    },
    {
      title: "Channels",
      href: "/channels/general",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Swift</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <SidebarNav items={sidebarNavItems} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl py-6 px-4">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="channels">My Channels</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information and how others see you on Swift.</CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSaveProfile}>
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={currentUser?.avatar || "/placeholder.svg"}
                            alt={currentUser?.displayName || "User"}
                          />
                          <AvatarFallback className="text-2xl">
                            {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                          Change Avatar
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={currentUser?.email || ""} disabled />
                          <p className="text-xs text-muted-foreground">
                            Your email address is used for login and cannot be changed.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself"
                            className="resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="online">Online</option>
                            <option value="away">Away</option>
                            <option value="busy">Busy</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : isSuccess ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Saved Successfully!
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Account Security</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button>Change Password</Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-lg font-medium">Account Type</h3>
                    <p className="text-sm text-muted-foreground">
                      Your account type determines your permissions and access levels.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={currentUser?.isAdmin ? "default" : "outline"}>
                        {currentUser?.isAdmin ? "Admin" : "Standard User"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels">
              <Card>
                <CardHeader>
                  <CardTitle>My Channels</CardTitle>
                  <CardDescription>Channels you are a member of</CardDescription>
                </CardHeader>
                <CardContent>
                  {userChannels.length === 0 ? (
                    <p className="text-muted-foreground">You are not a member of any channels yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {userChannels.map((channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">#</span>
                            <span>{channel.name}</span>
                            {channel.isPrivate && (
                              <Badge variant="outline" className="ml-2">
                                Private
                              </Badge>
                            )}
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/channels/${channel.id}`}>View Channel</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
