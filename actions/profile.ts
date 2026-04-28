"use server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ── Profile ──────────────────────────────────────────────────────────────────

// Fetch user

export async function fetchUser(userId: string) {
  try {
    const user = await db.user.findUnique({
  where: { id: userId },
  select: { name: true, email: true, image: true },
});
    return { success: true,  user };
  } catch (error) {
    return { success: false, error: "Failed fetch profile" };
  }
}


export async function updateProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  address?: string;
  image?: string;
}) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...data,
        name: data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : undefined,
      },
    });
    revalidatePath("/dashboard/profile");
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

// ── Account ───────────────────────────────────────────────────────────────────

export async function updateEmail(userId: string, newEmail: string) {
  try {
    const exists = await db.user.findUnique({ where: { email: newEmail } });
    if (exists) return { success: false, error: "Email already in use" };

    await db.user.update({ where: { id: userId }, data: { email: newEmail } });
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update email" };
  }
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user?.password) return { success: false, error: "No password set" };

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return { success: false, error: "Current password is incorrect" };

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { password: hashed } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update password" };
  }
}

export async function deleteAccount(userId: string) {
  try {
    // Cancel Stripe subscription first if active
    const sub = await db.subscription.findUnique({ where: { userId } });
    if (sub?.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    }
    await db.user.delete({ where: { id: userId } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete account" };
  }
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<{
    emailMarketing: boolean;
    emailOrderUpdates: boolean;
    emailSecurity: boolean;
    emailNewsletter: boolean;
    inAppOrders: boolean;
    inAppMessages: boolean;
    inAppPromotions: boolean;
  }>
) {
  try {
    await db.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...prefs },
      update: prefs,
    });
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save preferences" };
  }
}

// ── Subscription ──────────────────────────────────────────────────────────────



