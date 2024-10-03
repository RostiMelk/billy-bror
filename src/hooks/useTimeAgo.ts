import { pluralize } from "@/lib/utils";
import { useEffect, useState } from "react";

const calculateSecondsSinceMidnight = (date: Date) => {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return Math.floor((date.getTime() - midnight.getTime()) / 1000);
};

export function useTimeAgo(date: string | number | Date): string {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const past = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
      const secondsSinceMidnight = calculateSecondsSinceMidnight(now);

      switch (true) {
        case diffInSeconds < 60:
          setTimeAgo("Nettopp");
          break;
        case diffInSeconds < 3600: {
          const minutes = Math.floor(diffInSeconds / 60);
          setTimeAgo(`${minutes} min siden`);
          break;
        }
        case diffInSeconds < secondsSinceMidnight: {
          const hours = Math.floor(diffInSeconds / 3600);
          setTimeAgo(`${hours} ${pluralize(hours, "time", "timer")} siden`);
          break;
        }
        case diffInSeconds < 172800: {
          setTimeAgo("I går");
          break;
        }
        case diffInSeconds < 2592000: {
          const days = Math.floor(diffInSeconds / 86400);
          setTimeAgo(`${days} dager siden`);
          break;
        }
        case diffInSeconds < 31536000: {
          const months = Math.floor(diffInSeconds / 2592000);
          setTimeAgo(`${months} mnd siden`);
          break;
        }
        default: {
          const years = Math.floor(diffInSeconds / 31536000);
          setTimeAgo(`${years} år siden`);
        }
      }
    };

    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(intervalId);
  }, [date]);

  return timeAgo;
}
