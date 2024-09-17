import { LiveTracker } from "@/components/live-tracker";

export default function Home() {
  return (
    <div className="min-h-[100dvh] container mx-auto p-4 grid">
      <LiveTracker />
    </div>
  );
}
