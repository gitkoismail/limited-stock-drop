import { useEffect, useState } from "react";

export function useCountdown(expiresAt: string | null) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingSeconds(0);
      return;
    }

    function updateRemainingTime() {
      const expiresAtTime = new Date(expiresAt as string).getTime();
      const now = Date.now();

      const seconds = Math.max(
        0,
        Math.floor((expiresAtTime - now) / 1000)
      );

      setRemainingSeconds(seconds);
    }

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAt]);

  return remainingSeconds;
}