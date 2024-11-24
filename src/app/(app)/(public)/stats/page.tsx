import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { StatsContent } from "@/components/stats-content";
import { LoaderPinwheelIcon } from "lucide-react";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function Stats() {
  const session = await getServerSession();

  return (
    <div className="grid grid-rows-[auto,1fr] h-[100dvh] p-4">
      <Header session={session}>
        <Button size="sm" variant="secondary" asChild>
          <Link href="/">Hjem</Link>
        </Button>
      </Header>

      <Suspense fallback={<Loader />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}

function Loader() {
  return (
    <div className="grid place-items-center animate-rainbow">
      <LoaderPinwheelIcon className="animate-spin size-8" />
    </div>
  );
}
