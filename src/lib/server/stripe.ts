const STRIPE_API_BASE = "https://api.stripe.com/v1";

function requireStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return key;
}

export async function createStripeCheckoutSession(params: {
  customerEmail: string;
  userId: string;
}) {
  const stripeSecret = requireStripeSecretKey();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!appUrl || !priceId) {
    throw new Error("Missing billing environment variables.");
  }

  const baseUrl = appUrl.replace(/\/$/, "");
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("customer_email", params.customerEmail);
  body.set("success_url", `${baseUrl}/dashboard?billing=success`);
  body.set("cancel_url", `${baseUrl}/pagamento?billing=cancelled`);
  body.set("client_reference_id", params.userId);
  body.set("metadata[user_id]", params.userId);

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Stripe checkout error");
  }

  return payload as { id: string; url: string };
}

