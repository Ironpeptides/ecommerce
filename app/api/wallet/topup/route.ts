// app/api/wallet/topup/route.ts
// app/api/wallet/topup/route.ts
//
// Creates a LemonSqueezy checkout for a custom dollar amount.
// LemonSqueezy supports "custom price" checkouts via the checkout API
// when you set up a product with "Pay what you want" or use a
// flexible variant. See: https://docs.lemonsqueezy.com/api/checkouts
//
// Setup in LemonSqueezy dashboard:
//   Create ONE product called "Credits"
//   Set it as "Pay what you want" OR set a base price of $1
//   Store its variant ID in LEMONSQUEEZY_CREDITS_VARIANT_ID
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, credits, email } = await req.json();

    // Validate
    if (!amount || amount < 5 || amount > 999) {
      return NextResponse.json(
        { error: "Amount must be between $5 and $999" },
        { status: 400 }
      );
    }

    const lsApiKey    = process.env.LEMONSQUEEZY_API_KEY;
    const lsStoreId   = process.env.LEMONSQUEEZY_STORE_ID || "#364052";
    const lsVariantId = process.env.LEMONSQUEEZY_CREDITS_VARIANT_ID; // single variant for credits

    if (!lsApiKey || !lsStoreId || !lsVariantId) {
      console.error("[wallet/topup] Missing LemonSqueezy env vars");
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 500 }
      );
    }

    // Amount in cents for LemonSqueezy
    const amountInCents = Math.round(amount * 100);

    const lsResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${lsApiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: session.user.email,
              custom: {
                // These are passed back in the webhook payload
                user_email: session.user.email,
                credits: String(Math.round(credits)),  // credits to award
                amount_dollars: String(amount),
              },
            },
            // Override the price with the custom amount
            checkout_options: {
              // Pre-fill so users don't have to type their email
              email: session.user.email,
            },
            // Custom price override (cents)
            // This works when your LS product allows custom pricing
            custom_price: amountInCents,
            product_options: {
              name: `${Math.round(credits)} Credits`,
              description: `Top up ${Math.round(credits)} credits to your account`,
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
              receipt_thank_you_note:
                "Your credits have been added! You can close this tab and return to your order.",
              receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/wallet`,
            },
            // Expire checkout after 30 minutes
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          },
          relationships: {
            store: {
              data: { type: "stores", id: lsStoreId },
            },
            variant: {
              data: { type: "variants", id: lsVariantId },
            },
          },
        },
      }),
    });

    const lsData = await lsResponse.json();

    if (!lsResponse.ok) {
      console.error("[wallet/topup] LemonSqueezy API error:", JSON.stringify(lsData, null, 2));
      return NextResponse.json(
        { error: "Failed to create checkout. Please try again." },
        { status: 500 }
      );
    }

    const checkoutUrl = lsData?.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error("[wallet/topup] No checkout URL in response:", lsData);
      return NextResponse.json(
        { error: "No checkout URL returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });

  } catch (error: any) {
    console.error("[wallet/topup] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}