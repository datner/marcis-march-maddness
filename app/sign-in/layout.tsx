import type { ReactNode } from "react";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return <div className="h-full grid place-content-center">{children}</div>;
}
