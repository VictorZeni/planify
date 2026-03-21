import { NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/server/stripe";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError } from "@/lib/server/api-response";

export async function POST() {
  const access = await requireApiAccess();
  if ("errorResponse" in access) return access.errorResponse;
  const { user } = access;

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
      error instanceof Error ? error.message : "Nao foi possivel iniciar checkout Stripe.";
    return apiError(message, 400);
  }
}
