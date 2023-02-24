"use client";

import { useUser } from "@clerk/nextjs";

export function Title() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <span>Hello, Person!</span>;
  }

  return (
    <span className="capitalize">
      Hello, {user?.firstName} {user?.lastName}!
    </span>
  );
}
