import { EntryBanner } from "@/components/entry-banner";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoaderCircleIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Billy Bror",
  description: "A poop tracker for the modern age",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  appleWebApp: {
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <EntryBanner />
        <div className="container grid max-w-xl">{children}</div>
      </Suspense>
    </>
  );
}

function Loader() {
  return (
    <div className="h-[100dvh] grid place-items-center">
      <LoaderCircleIcon className="animate-spin size-8 text-muted-foreground" />
    </div>
  );
}
