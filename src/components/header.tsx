import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import type { Session } from "next-auth";

interface HeaderProps {
  children?: React.ReactNode;
  session?: Session;
}

export const Header = ({ children, session }: HeaderProps) => {
  return (
    <header className="h-10 flex justify-between items-center">
      <Link href="/">
        <h2 className="text-lg font-semibold text-secondary-foreground">
          🐶 Billy Bror
        </h2>
      </Link>

      <nav className="flex items-center gap-3">
        {children}
        <UserMenu session={session} />
      </nav>
    </header>
  );
};
