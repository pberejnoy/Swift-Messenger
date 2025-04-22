import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, CheckCircle, HelpCircle } from "lucide-react"

export default function LoginHelpPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Login Troubleshooting Guide</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Common Login Issues</CardTitle>
          <CardDescription>
            If you're having trouble logging in, here are some common issues and solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Invalid email or password" error
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This is the most common error and can occur for several reasons:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
              <li>You may have mistyped your email address or password</li>
              <li>Caps Lock might be turned on (passwords are case-sensitive)</li>
              <li>You might be using an email address that's not registered</li>
              <li>You might be using an old password if you've changed it recently</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Account temporarily locked" message
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              For security reasons, your account will be temporarily locked after 5 failed login attempts. The lock will
              automatically be removed after 5 minutes. If you need immediate access, please contact an administrator.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Too many login attempts" message
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This is a rate-limiting measure to prevent brute force attacks. If you see this message, wait a few
              minutes before trying again.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center font-medium">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              "Invalid email format" error
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your email must be in a valid format (e.g., name@example.com). Check for typos, missing characters, or
              extra spaces.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/diagnostic/login">
              Run Login Diagnostic <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Checklist</CardTitle>
          <CardDescription>Follow these steps to ensure successful login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Check your internet connection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Make sure you're connected to the internet. The login page will show an offline warning if you're not
                connected.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Double-check admin credentials</h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you're trying to log in as admin, make sure you're using the exact email address:{" "}
                <strong>pberejnoy@v0.com</strong>. Common typos like "pberejnoy@gmail.com" will not work.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Verify your email format</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Double-check that your email is entered correctly and in the proper format (e.g., name@example.com).
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Check Caps Lock</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Passwords are case-sensitive. Make sure Caps Lock is not enabled when typing your password.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Clear browser cache and cookies</h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you're experiencing persistent issues, try clearing your browser's cache and cookies, or use a
                different browser.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Admin Account Information</h3>
            <p className="text-blue-700 dark:text-blue-300">
              Email: pberejnoy@v0.com
              <br />
              Password: Sl@ckV0
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" asChild>
            <Link href="/login">Back to Login</Link>
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
