import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Billy Bror",
  description: "A poop tracker for the modern age",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isRootRoute = pathname === "/";

  return (
    <html lang="en">
      <body
        className={cn(
          inter.variable,
          "antialiased",
          isRootRoute && "overflow-hidden",
        )}
      >
        <div className="container grid min-h-[100dvh] max-w-md p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
