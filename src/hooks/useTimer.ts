import { useState, useEffect } from "react";

interface ShortVersionOptions {
  format: "short" | "long";
}

export function useTimer(
  startTime?: string,
  options: ShortVersionOptions = { format: "long" },
) {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  useEffect(() => {
    function updateElapsedTime() {
      if (!startTime) {
        return;
      }
      const start = new Date(startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (options.format === "short" && hours === 0) {
        setElapsedTime(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      } else {
        setElapsedTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    }

    updateElapsedTime(); // Call immediately to avoid initial delay
    const intervalId = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, options]);

  return elapsedTime;
}
