"use client"
import { SignUp } from "@clerk/nextjs/app-beta"
import { dark } from "@clerk/themes"
import { useIsDarkMode } from "~hooks/useIsDarkMode"

export default function Page() {
  const isDark = useIsDarkMode()
  return <SignUp appearance={{ baseTheme: isDark ? dark : undefined }} path="/sign-up" signInUrl="/sign-up" afterSignUpUrl="/create-team" afterSignInUrl="/dashboard" />
}
