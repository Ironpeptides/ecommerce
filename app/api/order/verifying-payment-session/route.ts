import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

// Define a type for your session to keep TypeScript happy
interface PaymentSession {
  userId: string;
  // add other fields here if needed, e.g., amount: number;
}

export async function GET(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Read & validate sessionId ─────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId query param is required" },
        { status: 400 }
      );
    }

    // ── Fetch from Redis ──────────────────────────────────────────────────────
    // Upstash automatically parses JSON, so 'session' will be an object or null
    const session = await redis.get<PaymentSession>(`payment-session:${sessionId}`);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    // ── Ownership check — users can only verify their own sessions ────────────
    if (session.userId !== authSession.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, session }, { status: 200 });
  } catch (error) {
    console.error("[verify-session] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}