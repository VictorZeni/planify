import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripeCheckoutSession } from "@/lib/server/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const checkout = await createStripeCheckoutSession({
      customerEmail: user.email ?? "",
      userId: user.id,
    });

    return NextResponse.json({
      data: {
        sessionId: checkout.id,
        url: checkout.url,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível iniciar checkout Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

