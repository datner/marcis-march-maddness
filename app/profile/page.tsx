"use client"
import { UserProfile } from "@clerk/nextjs/app-beta"
import { dark } from "@clerk/themes"
import { useIsDarkMode } from "~hooks/useIsDarkMode"

export default function Page() {
  const isDark = useIsDarkMode()
  return <UserProfile appearance={{ baseTheme: isDark ? dark : undefined }} path="/profile" />
}

