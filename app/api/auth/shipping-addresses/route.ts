// app/api/shipping-address/route.ts

import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  try {
    // Real DB call — uncomment when ready
    // const { searchParams } = new URL(req.url);
    // const userId = searchParams.get("userId");
    //
    // if (!userId) {
    //   return NextResponse.json({ error: "userId is required" }, { status: 400 });
    // }
    //
    // const shippingAddress = await db.shippingAddress.findFirst({
    //   where: { userId },
    // });
    //
    // if (!shippingAddress) {
    //   return NextResponse.json({ error: "No shipping address found" }, { status: 404 });
    // }
    //
    // return NextResponse.json({ data: shippingAddress }, { status: 200 });

    // Hardcoded for now
    const shippingAddress = {
      id: "addr_123",
      userId: "user_123",
      fullName: "John Doe",
      phone: "+1 555 000 1234",
      addressLine1: "410 Terry Ave. North",
      addressLine2: "Suite 100",
      city: "Seattle",
      state: "WA",
      postalCode: "98109",
      country: "US",
      isDefault: true,
    };

    return NextResponse.json({ data: shippingAddress }, { status: 200 });
  } catch (error) {
    console.error("Error fetching shipping address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}