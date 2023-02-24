"use client";
import { UserButton } from "@clerk/nextjs/app-beta";
import { dark } from "@clerk/themes";
import * as NavMenu from "@radix-ui/react-navigation-menu";
import { useIsDarkMode } from "~hooks/useIsDarkMode";

export default function Header() {
  const isDark = useIsDarkMode();
  return (
    <NavMenu.Root className="navbar bg-base-300 text-neutral-content">
      <div className="navbar-start" />
      <div className="navbar-center" />
      <div className="navbar-end">
        <UserButton
          showName
          appearance={{ baseTheme: isDark ? dark : undefined }}
          userProfileUrl="/profile"
          afterSignOutUrl="/sign-in"
          signInUrl="/sign-in"
        />
      </div>
    </NavMenu.Root>
  );
}
