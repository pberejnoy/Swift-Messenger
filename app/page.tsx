import Link from "next/link"
import { Button } from "@/components/ui/button"
import { routes } from "@/src/core/routing/routes"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Swift Messenger</h1>
      <p className="text-lg text-muted-foreground mb-8">A real-time messaging application</p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button asChild className="w-full">
          <Link href={routes.public.login}>Sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={routes.public.register}>Create an account</Link>
        </Button>
        <div className="mt-4">
          <Button asChild variant="link">
            <Link href="/supabase-test">Verify Supabase Connection</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
