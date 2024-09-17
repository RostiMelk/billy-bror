interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <header className="h-10 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-secondary-foreground">
        🐶 Billy Bror
      </h2>

      <nav className="flex items-center gap-3">{children}</nav>
    </header>
  );
};
