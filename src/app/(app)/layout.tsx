import { EntryBanner } from "@/components/entry-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billy Bror",
  description: "A poop tracker for the modern age",
  viewport: {
    width: "device-width",
    initialScale: 1,
    userScalable: false,
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
      <EntryBanner />
      <div className="container grid max-w-xl">{children}</div>
    </>
  );
}
