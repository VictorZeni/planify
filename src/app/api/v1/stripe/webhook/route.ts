import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function resolveTargetUserId(eventData: {
  metadata?: { user_id?: string };
  customer_details?: { email?: string | null };
}) {
  const userId = eventData.metadata?.user_id;
  if (userId) return userId;

  const email = eventData.customer_details?.email;
  if (!email) return null;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    throw new Error(error.message);
  }

  const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  return user?.id ?? null;
}

async function setUserAuthorization(userId: string, isAuthorized: boolean) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("profiles").upsert({
    id: userId,
    is_authorized: isAuthorized,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !verifyStripeSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data: {
      object: {
        metadata?: { user_id?: string };
        customer_details?: { email?: string | null };
      };
    };
  };

  const userId = await resolveTargetUserId(event.data.object);
  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    await setUserAuthorization(userId, true);
  }

  if (event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed") {
    await setUserAuthorization(userId, false);
  }

  return NextResponse.json({ ok: true });
}
