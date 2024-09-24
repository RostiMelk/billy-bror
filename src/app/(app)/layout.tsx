import { EntryBanner } from "@/components/entry-banner";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 as LoadingSpinner } from "lucide-react";

export const metadata: Metadata = {
  title: "Billy Bror",
  description: "A poop tracker for the modern age",
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loader />}>
      <EntryBanner />
      <div className="container grid max-w-xl">{children}</div>
    </Suspense>
  );
}

function Loader() {
  return (
    <div className="h-[100dvh] grid place-items-center">
      <LoadingSpinner className="animate-spin" />
    </div>
  );
}
