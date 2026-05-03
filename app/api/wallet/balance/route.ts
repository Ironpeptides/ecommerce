// app/api/wallet/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth"; 
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, walletBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.walletBalance,      // in credits
      userId: user.id,
    });
  } catch (error: any) {
    console.error("[wallet/balance] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}