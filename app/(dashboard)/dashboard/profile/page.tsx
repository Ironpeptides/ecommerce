import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profileClient";

export default async function ProfilePage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  const [user, subscription, notifPrefs] = await Promise.all([
    db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true, name: true, firstName: true, lastName: true,
        email: true, phone: true, image: true, jobTitle: true,
        address: true, isVerified: true, createdAt: true,
        subscriptionStatus: true,
      },
    }),
    db.subscription.findUnique({ where: { userId: authUser.id } }),
    db.notificationPreference.findUnique({ where: { userId: authUser.id } }),
  ]);

  if (!user) redirect("/login");

  return (
    <ProfileClient
      user={user}
      subscription={subscription}
      notifPrefs={notifPrefs}
    />
  );
}