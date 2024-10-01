import { Suspense } from "react";
import { StatsContent } from "@/components/stats-content";
import { LoaderCircleIcon } from "lucide-react";

export default async function Stats() {
  return (
    <Suspense fallback={<Loader />}>
      <StatsContent />
    </Suspense>
  );
}

function Loader() {
  return (
    <div className="h-[100dvh] grid place-items-center">
      <LoaderCircleIcon className="animate-spin size-8 text-muted-foreground" />
    </div>
  );
}
