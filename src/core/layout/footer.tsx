export function Footer() {
  return (
    <footer className="border-t py-4 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Swift Messenger. All rights reserved.
        </p>
        <p className="text-center text-sm text-muted-foreground">Built with Next.js, Supabase, and Tailwind CSS</p>
      </div>
    </footer>
  )
}
