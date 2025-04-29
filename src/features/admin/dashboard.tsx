"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/src/services/supabase/client"
import { Users, MessageSquare, Bell } from "lucide-react"

/**
 * AdminDashboard - Main dashboard component for the admin panel
 * Displays key metrics and system status
 */
export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChannels: 0,
    totalMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!supabase) {
        console.warn("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })

        // Fetch channel count
        const { count: channelCount, error: channelError } = await supabase
          .from("channels")
          .select("*", { count: "exact", head: true })

        // Fetch message count
        const { count: messageCount, error: messageError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })

        if (userError || channelError || messageError) {
          console.error("Error fetching stats:", { userError, channelError, messageError })
        } else {
          setStats({
            totalUsers: userCount || 0,
            totalChannels: channelCount || 0,
            totalMessages: messageCount || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Users"
          value={loading ? "Loading..." : stats.totalUsers.toString()}
          description="Registered users in the system"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Total Channels"
          value={loading ? "Loading..." : stats.totalChannels.toString()}
          description="Active channels"
          icon={<MessageSquare className="h-6 w-6" />}
        />
        <StatCard
          title="Total Messages"
          value={loading ? "Loading..." : stats.totalMessages.toString()}
          description="Messages sent"
          icon={<Bell className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>Recent system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <LogItem timestamp="2023-04-27 07:15:10" message="System backup completed successfully" />
              <LogItem timestamp="2023-04-27 06:30:22" message="New user registered: john@example.com" />
              <LogItem timestamp="2023-04-27 05:45:18" message="Channel 'General' created" />
              <LogItem timestamp="2023-04-27 04:20:05" message="System update deployed" />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Showing recent logs only. View all in Logs section.</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusItem label="API" status="operational" />
              <StatusItem label="Database" status="operational" />
              <StatusItem label="Storage" status="operational" />
              <StatusItem label="Authentication" status="operational" />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface LogItemProps {
  timestamp: string
  message: string
}

function LogItem({ timestamp, message }: LogItemProps) {
  return (
    <div className="flex items-center text-sm">
      <span className="font-mono text-xs text-muted-foreground mr-2">{timestamp}</span>
      <span>{message}</span>
    </div>
  )
}

interface StatusItemProps {
  label: string
  status: "operational" | "degraded" | "outage"
}

function StatusItem({ label, status }: StatusItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case "operational":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "outage":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <div className="flex items-center">
        <div className={`h-2 w-2 rounded-full ${getStatusColor()} mr-2`} />
        <span className="text-sm capitalize">{status}</span>
      </div>
    </div>
  )
}
