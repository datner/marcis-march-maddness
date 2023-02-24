import { ReactNode } from "react";
import Header from "./Header";

export default function GameLayout({ children }: { children: ReactNode }) {
  return <div>
    <Header />
    {children}
  </div>
}
