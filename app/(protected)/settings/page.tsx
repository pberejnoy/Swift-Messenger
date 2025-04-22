"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Check } from "lucide-react"
import LoadingScreen from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { currentUser, isLoading, updateUserSettings } = useAuth()
  const { toast } = useToast()

  // Theme settings
  const [darkMode, setDarkMode] = useState(true)
  const [compactView, setCompactView] = useState(false)
  const [theme, setTheme] = useState("system")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [mentionNotifications, setMentionNotifications] = useState(true)

  // Privacy settings
  const [showStatus, setShowStatus] = useState(true)
  const [showLastSeen, setShowLastSeen] = useState(true)
  const [allowDirectMessages, setAllowDirectMessages] = useState("everyone")

  // State for saving
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateUserSettings({
        appearance: {
          darkMode,
          compactView,
          theme,
        },
      })

      setIsSuccess(true)
      toast({
        title: "Settings saved",
        description: "Your appearance settings have been updated.",
      })

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateUserSettings({
        notifications: {
          email: emailNotifications,
          desktop: desktopNotifications,
          sound: soundEnabled,
          mentions: mentionNotifications,
        },
      })

      setIsSuccess(true)
      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated.",
      })

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateUserSettings({
        privacy: {
          showStatus,
          showLastSeen,
          allowDirectMessages,
        },
      })

      setIsSuccess(true)
      toast({
        title: "Settings saved",
        description: "Your privacy settings have been updated.",
      })

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="container max-w-4xl py-6 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-4 w-full overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="appearance" className="flex-1 px-2 sm:px-4">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 px-2 sm:px-4">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex-1 px-2 sm:px-4">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1 px-2 sm:px-4">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how Swift looks and feels.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveAppearance} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for a more comfortable viewing experience in low light.
                      </p>
                    </div>
                    <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-view">Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing between messages for a more compact layout.
                      </p>
                    </div>
                    <Switch id="compact-view" checked={compactView} onCheckedChange={setCompactView} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="swift">Swift Brand</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme or use your system settings.
                    </p>
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates.
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications when you receive new messages.
                      </p>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={desktopNotifications}
                      onCheckedChange={setDesktopNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-enabled">Sound Notifications</Label>
                      <p className="text-sm text-muted-foreground">Play a sound when you receive new messages.</p>
                    </div>
                    <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="mention-notifications">Mention Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone mentions you in a message.
                      </p>
                    </div>
                    <Switch
                      id="mention-notifications"
                      checked={mentionNotifications}
                      onCheckedChange={setMentionNotifications}
                    />
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

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePrivacy} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-status">Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see when you're online.</p>
                    </div>
                    <Switch id="show-status" checked={showStatus} onCheckedChange={setShowStatus} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-last-seen">Show Last Seen</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see when you were last active.</p>
                    </div>
                    <Switch id="show-last-seen" checked={showLastSeen} onCheckedChange={setShowLastSeen} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direct-messages">Who can send you direct messages</Label>
                    <Select value={allowDirectMessages} onValueChange={setAllowDirectMessages}>
                      <SelectTrigger id="direct-messages">
                        <SelectValue placeholder="Select who can message you" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="team-members">Team Members Only</SelectItem>
                        <SelectItem value="nobody">Nobody</SelectItem>
                      </SelectContent>
                    </Select>
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

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced options for Swift.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Data Management</h3>
                <p className="text-sm text-muted-foreground">Manage your data and export options.</p>
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="outline">Export Chat History</Button>
                  <Button variant="outline">Clear Cache</Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium">Developer Options</h3>
                <p className="text-sm text-muted-foreground">Advanced options for developers.</p>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="developer-mode">Developer Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable additional debugging features.</p>
                  </div>
                  <Switch id="developer-mode" />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium">Performance</h3>
                <p className="text-sm text-muted-foreground">Adjust settings to optimize performance.</p>
                <div className="space-y-2">
                  <Label htmlFor="message-limit">Message History Limit</Label>
                  <Select defaultValue="500">
                    <SelectTrigger id="message-limit">
                      <SelectValue placeholder="Select message limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 messages</SelectItem>
                      <SelectItem value="250">250 messages</SelectItem>
                      <SelectItem value="500">500 messages</SelectItem>
                      <SelectItem value="1000">1000 messages</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
