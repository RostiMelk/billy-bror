import { Suspense } from "react";
import { StatsContent } from "@/components/stats-content";
import { LoaderPinwheelIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Stats() {
  return (
    <Suspense fallback={<Loader />}>
      <StatsContent />
    </Suspense>
  );
}

function Loader() {
  return (
    <div className="h-[100dvh] grid place-items-center animate-rainbow">
      <LoaderPinwheelIcon className="animate-spin size-8" />
    </div>
  );
}
