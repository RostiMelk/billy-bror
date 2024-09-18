import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Tracker } from "@/components/tracker";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    return redirect("/login");
  }

  return <Tracker />;
}
