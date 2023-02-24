import type { ReactNode } from 'react'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-content-center">
      {children}
    </div>
  )
}

