"use client";

import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={cn("antialiased", inter.className)}>
          {children}
          <Toaster />
        </body>
      </html>
    </SessionProvider>
  );
}
