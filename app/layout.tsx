import { ClerkProvider } from "@clerk/nextjs/app-beta";
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-screen">
        {/*
        <head /> will contain the components returned by the nearest parent
        head.jsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
        <head />
        <body className="h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
