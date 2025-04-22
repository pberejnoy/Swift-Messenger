import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, CheckCircle, HelpCircle } from "lucide-react"

export default function ChannelHelpPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Channel Creation Troubleshooting</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Common Issues with Channel Creation</CardTitle>
          <CardDescription>
            If you're having trouble creating channels, here are some common issues and solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Channel name already exists" error
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Channel names must be unique. Try a different name or add a number to make it unique.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Invalid channel name format" error
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Channel names can only contain letters, numbers, hyphens, and underscores. No spaces or special characters
              are allowed.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Database error" or "Unexpected error" message
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This could indicate a temporary server issue. Wait a few minutes and try again. If the problem persists,
              contact support.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              No error message, but channel isn't created
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This could be a network issue or a problem with your browser. Try refreshing the page or using a different
              browser.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/diagnostic/channels">
              Run Channel Diagnostic <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel Creation Checklist</CardTitle>
          <CardDescription>Follow these steps to ensure successful channel creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Verify you're logged in</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Make sure you're properly logged in. Try logging out and back in if necessary.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Check channel name format</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use only letters, numbers, hyphens, and underscores in your channel name.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Ensure the channel name is unique</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check the existing channels to make sure your channel name isn't already taken.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Check your internet connection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Make sure you have a stable internet connection when creating channels.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" asChild>
            <Link href="/channels">Back to Channels</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/contact-support">
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
