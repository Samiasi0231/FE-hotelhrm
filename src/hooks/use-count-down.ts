// src/pages/public/hooks/useCountdown.ts
import { useEffect, useState } from "react";

export function useCountdown(startedAt: Date | null, minutes: number) {
  const [secondsLeft, setSecondsLeft] = useState<number>(minutes * 60);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!startedAt) return;
    const end = new Date(startedAt.getTime() + minutes * 60 * 1000);

    const tick = () => {
      const remaining = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) setExpired(true);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, minutes]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = startedAt ? (secondsLeft / (minutes * 60)) * 100 : 100;

  return { mm, ss, pct, expired, secondsLeft };
}