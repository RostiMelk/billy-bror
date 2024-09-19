import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) {
    return redirect("/login");
  }

  return children;
}
