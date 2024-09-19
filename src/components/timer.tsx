"use client";

import { useTimer } from "../hooks/useTimer";

interface TimerProps {
  startTime: string;
}

export const Timer = ({ startTime }: TimerProps) => {
  const elapsedTime = useTimer(startTime);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xl mb-3 font-medium">Tur pågår</p>
      <p className="text-7xl tabular-nums font-medium">{elapsedTime}</p>
    </div>
  );
};
