"use client";

import { useRouter } from "next/navigation";
import { FormEventHandler, ReactNode, useTransition, useState } from "react";

export function Form(props: { children?: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsFetching(true);
    const formData = new FormData(e.currentTarget);

    await fetch("/api/create-team", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("teamName"),
        players: formData.getAll("players[]"),
      }),
    });
    setIsFetching(false);

    startTransition(() => {
      router.push("/dashboard");
    });
  };

  return (
    <form
      className="aria-[busy]:opacity-75 opacity-100 transition-opacity"
      aria-busy={isPending || isFetching}
      onSubmit={handleSubmit}
    >
      {props.children}
    </form>
  );
}
