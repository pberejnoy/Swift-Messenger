"use client"

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-lg font-medium">Loading...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we set things up</p>
      </div>
    </div>
  )
}
