import { getServerSession, type Session } from "next-auth";
import type { ComponentType } from "react";

export function withSession<P extends { session: Session | null }>(
  Component: ComponentType<P>,
) {
  return async function WithSession(props: Omit<P, "session">) {
    const session = await getServerSession();
    return <Component {...(props as P)} session={session} />;
  };
}
