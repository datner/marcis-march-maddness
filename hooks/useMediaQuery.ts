"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    try {
      return matchMedia(query).matches;
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const matchList = matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(matchList.matches);

    matchList.addEventListener("change", handleChange);
    return () => {
      matchList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
