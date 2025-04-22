import { redirect } from "next/navigation"

// Redirect to channels by default
export default function DirectMessagesPage() {
  redirect("/channels/general")
}
