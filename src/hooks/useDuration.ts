import { useEffect, useState } from "react";

export function useDuration(
  from: string | number | Date,
  to?: string | number | Date,
): string {
  const [duration, setDuration] = useState<string>("");

  useEffect(() => {
    const updateDuration = () => {
      if (!to) {
        return;
      }

      const start = new Date(from);
      const end = new Date(to);
      const diffInSeconds = Math.floor(
        (end.getTime() - start.getTime()) / 1000,
      );
      const totalMinutes = Math.floor(diffInSeconds / 60);
      setDuration(`${totalMinutes} min`);
    };

    updateDuration();
    const intervalId = setInterval(updateDuration, 60000);

    return () => clearInterval(intervalId);
  }, [from, to]);

  return duration;
}
