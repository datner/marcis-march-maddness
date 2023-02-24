"use client";
import { SignIn } from "@clerk/nextjs/app-beta";
import { dark } from "@clerk/themes";
import { useIsDarkMode } from "~hooks/useIsDarkMode";

export default function Page() {
  const isDark = useIsDarkMode();
  return (
    <SignIn
      appearance={{ baseTheme: isDark ? dark : undefined }}
      path="/sign-in"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/create-team"
    />
  );
}
