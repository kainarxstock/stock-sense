import { useEffect, useState } from "react";

/** Incrementing tick so consumers re-render for relative time labels. */
export function useNowTick(stepMs = 1000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), stepMs);
    return () => window.clearInterval(id);
  }, [stepMs]);
  return tick;
}
