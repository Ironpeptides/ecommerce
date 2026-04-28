import { SupportClient } from "./supportClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { getUserTickets } from "@/actions/support";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);

  // Only fetch tickets if logged in
  const tickets = session?.user
    ? await getUserTickets().catch(() => [])
    : [];

  return (
    <SupportClient
      user={session?.user ?? null}
      tickets={tickets}
    />
  );
}