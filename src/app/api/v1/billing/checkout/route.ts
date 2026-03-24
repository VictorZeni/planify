import { NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/server/stripe";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError } from "@/lib/server/api-response";
import { isPaymentActive } from "@/lib/server/billing-status";
import { DEFAULT_KIWIFY_CHECKOUT_URL } from "@/lib/billing-config";

export async function POST() {
  const access = await requireApiAccess();
  if ("errorResponse" in access) return access.errorResponse;
  const { user, access: accessState } = access;

  if (isPaymentActive(accessState.billingStatus)) {
    return NextResponse.json({
      data: {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`,
        alreadyActive: true,
      },
    });
  }

  try {
    const paymentProvider = process.env.PAYMENT_PROVIDER ?? "kiwify";
    const checkoutUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL ?? DEFAULT_KIWIFY_CHECKOUT_URL;

    if (paymentProvider === "kiwify") {
      const url = new URL(checkoutUrl);
      url.searchParams.set("email", user.email ?? "");
      url.searchParams.set("external_id", user.id);
      return NextResponse.json({
        data: {
          url: url.toString(),
          provider: "kiwify",
        },
      });
    }

    const checkout = await createStripeCheckoutSession({
      customerEmail: user.email ?? "",
      userId: user.id,
    });

    return NextResponse.json({
      data: {
        sessionId: checkout.id,
        url: checkout.url,
        provider: "stripe",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nao foi possivel iniciar checkout Stripe.";
    return apiError(message, 400);
  }
}

