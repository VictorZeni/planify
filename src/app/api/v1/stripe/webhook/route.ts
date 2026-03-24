import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPaymentActive } from "@/lib/server/billing-status";

const STRIPE_SIGNATURE_TOLERANCE_SEC = 300;

function verifyStripeSignature(payload: string, signatureHeader: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return false;

  const signatures = signatureHeader.split(",").reduce<Record<string, string>>((acc, pair) => {
    const [key, value] = pair.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const timestamp = signatures.t;
  const signature = signatures.v1;
  if (!timestamp || !signature) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  const tsSec = Number(timestamp);
  if (!Number.isFinite(tsSec)) return false;
  if (Math.abs(nowSec - tsSec) > STRIPE_SIGNATURE_TOLERANCE_SEC) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

type StripeSessionObject = {
  metadata?: { user_id?: string };
  client_reference_id?: string | null;
  customer?: string | null;
  customer_details?: { email?: string | null };
  subscription?: string | null;
};

type StripeSubscriptionObject = {
  metadata?: { user_id?: string };
  customer?: string | null;
  id?: string | null;
  status?: string | null;
};

async function resolveTargetUserId(
  eventData: StripeSessionObject | StripeSubscriptionObject,
) {
  const userId =
    eventData.metadata?.user_id ??
    ("client_reference_id" in eventData ? eventData.client_reference_id ?? undefined : undefined);

  if (userId) return userId;

  const email = "customer_details" in eventData ? eventData.customer_details?.email : null;
  if (!email) return null;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    throw new Error(error.message);
  }

  const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  return user?.id ?? null;
}

async function setBillingState(params: {
  userId: string;
  billingStatus: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const adminClient = createAdminClient();
  const authorized = isPaymentActive(params.billingStatus);

  const { error } = await adminClient.from("profiles").upsert({
    id: params.userId,
    billing_status: params.billingStatus,
    is_authorized: authorized,
    stripe_customer_id: params.stripeCustomerId ?? null,
    stripe_subscription_id: params.stripeSubscriptionId ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

function sanitizeBillingStatus(status: string | null | undefined) {
  if (!status) return "inactive";

  if (status === "active" || status === "trialing") return status;
  if (status === "past_due" || status === "canceled" || status === "unpaid") return status;

  return "inactive";
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !verifyStripeSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    type: string;
    data: {
      object: StripeSessionObject | StripeSubscriptionObject;
    };
  };

  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const object = event.data.object;
  const userId = await resolveTargetUserId(object);
  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = object as StripeSessionObject;
    await setBillingState({
      userId,
      billingStatus: "active",
      stripeCustomerId: session.customer ?? null,
      stripeSubscriptionId: session.subscription ?? null,
    });
  }

  if (event.type === "invoice.paid") {
    const invoice = object as StripeSessionObject;
    await setBillingState({
      userId,
      billingStatus: "active",
      stripeCustomerId: invoice.customer ?? null,
    });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = object as StripeSessionObject;
    await setBillingState({
      userId,
      billingStatus: "past_due",
      stripeCustomerId: invoice.customer ?? null,
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = object as StripeSubscriptionObject;
    await setBillingState({
      userId,
      billingStatus: sanitizeBillingStatus(subscription.status),
      stripeCustomerId: subscription.customer ?? null,
      stripeSubscriptionId: subscription.id ?? null,
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = object as StripeSubscriptionObject;
    await setBillingState({
      userId,
      billingStatus: "canceled",
      stripeCustomerId: subscription.customer ?? null,
      stripeSubscriptionId: subscription.id ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}

