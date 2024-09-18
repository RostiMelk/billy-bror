"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  return (
    <div className="text-center grid grid-rows-[auto,1fr] items-center h-[100dvh] p-4">
      <Header>
        <Button variant="outline" size="sm" asChild>
          <Link href="/stats">Statistikk</Link>
        </Button>
      </Header>

      <main className="my-8 text-center">
        <h1 className="text-muted-foreground font-medium mb-2">
          Du må logge inn for å fortsette
        </h1>

        <Button
          variant="outline"
          size="lg"
          className="flex items-center mx-auto mb-8"
          onClick={handleGoogleSignIn}
        >
          <img src="/google-logo.svg" alt="" className="w-5 h-5 mr-2" />
          Sign in with Google
        </Button>
      </main>
    </div>
  );
}
