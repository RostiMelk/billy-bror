import { getLatestOutsideEntry } from "@/lib/actions";

export const LastTrip = async () => {
  const data = await getLatestOutsideEntry();

  if (!data) {
    return <h1 className="text-4xl font-medium">Gå ut og tiss!</h1>;
  }

  const formatTimeAndDate = () => {
    const startDate = new Date(data.startTime as string);
    const endDate = new Date(data.endTime as string);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("no-NO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatDate = (date: Date) => {
      if (date.toDateString() === today.toDateString()) {
        return formatTime(date);
      }
      if (date.toDateString() === yesterday.toDateString()) {
        return `i går, ${formatTime(date)}`;
      }
      return date.toLocaleDateString("no-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const time = formatTimeAndDate();

  return (
    <div>
      <h2 className="text-2xl mb-2">Sist tur var</h2>
      <p className="text-5xl tabular-nums font-medium">{time}</p>
      <p className="mt-6 flex gap-2 text-3xl justify-center">
        {Array(data.pees || 0)
          .fill("💦")
          .map((emoji, i) => (
            <span key={`pee-${i}`}>{emoji}</span>
          ))}
        {Array(data.poops || 0)
          .fill("💩")
          .map((emoji, i) => (
            <span key={`poop-${i}`}>{emoji}</span>
          ))}
      </p>
    </div>
  );
};

export const LastTripSkeleton = () => {
  return (
    <div>
      <h1 className="text-2xl mb-2">Sist tur var</h1>
      <div className="text-5xl tabular-nums font-medium animate-pulse w-1/2 h-10 mx-auto bg-secondary rounded-md" />
      <div className="mt-6 flex gap-2 text-3xl justify-center">
        <span className="animate-pulse">🐶</span>
      </div>
    </div>
  );
};
