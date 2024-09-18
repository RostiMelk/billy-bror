"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  startTime: string;
}

export const Timer = ({ startTime }: TimerProps) => {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  useEffect(() => {
    const updateElapsedTime = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateElapsedTime(); // Call immediately to avoid initial delay
    const intervalId = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xl mb-3 font-medium">Tur pågår</p>
      <p className="text-7xl tabular-nums font-medium">{elapsedTime}</p>
    </div>
  );
};
