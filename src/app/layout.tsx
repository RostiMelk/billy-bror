"use client";

import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={cn("antialiased")}>{children}</body>
      </html>
    </SessionProvider>
  );
}
