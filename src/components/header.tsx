import Link from "next/link";

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <header className="h-10 flex justify-between items-center">
      <Link href="/">
        <h2 className="text-lg font-semibold text-secondary-foreground">
          🐶 Billy Bror
        </h2>
      </Link>

      <nav className="flex items-center gap-3">{children}</nav>
    </header>
  );
};
