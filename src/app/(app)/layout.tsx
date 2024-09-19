import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billy Bror",
  description: "A poop tracker for the modern age",
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="container grid max-w-md">{children}</div>;
}