import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { type BillingStatus, isPaymentActive } from "@/lib/server/billing-status";

type KiwifyPayload = {
  id?: string | number;
  event?: string;
  order_id?: string | number;
  orderId?: string | number;
  transaction_id?: string | number;
  transactionId?: string | number;
  status?: string;
  payment_status?: string;
  email?: string;
  customer_email?: string;
  customer?: { email?: string };
  product_name?: string;
  product?: { name?: string };
};

function hash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function verifyKiwifyWebhook(request: Request) {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;
  if (!secret) return true;

  const headerToken =
    request.headers.get("x-kiwify-token") ??
    request.headers.get("x-webhook-token") ??
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;

  if (!headerToken) return false;
  return headerToken === secret;
}

export function normalizeKiwifyPayload(payload: KiwifyPayload) {
  const email =
    payload.email ??
    payload.customer_email ??
    payload.customer?.email ??
    null;

  const rawStatus =
    payload.payment_status ??
    payload.status ??
    payload.event ??
    "unknown";

  const status = String(rawStatus).toLowerCase();
  const externalEventId = String(
    payload.id ??
      payload.order_id ??
      payload.orderId ??
      payload.transaction_id ??
      payload.transactionId ??
      hash(JSON.stringify(payload)),
  );

  const orderRef = String(
    payload.order_id ?? payload.orderId ?? payload.transaction_id ?? payload.transactionId ?? "",
  );
  const productName = payload.product_name ?? payload.product?.name ?? null;

  return {
    email,
    status,
    externalEventId,
    orderRef,
    productName,
  };
}

export function mapKiwifyStatusToBilling(status: string): BillingStatus {
  if (["paid", "approved", "completed", "charge_approved", "active"].includes(status)) {
    return "active";
  }

  if (["refunded", "refund", "canceled", "cancelled", "chargeback"].includes(status)) {
    return "canceled";
  }

  if (["expired", "unpaid", "failed"].includes(status)) {
    return "unpaid";
  }

  return "inactive";
}

export async function findUserIdByEmail(email: string) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) throw new Error(error.message);

  const match = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

export async function inviteUserForAccess(email: string) {
  const adminClient = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const redirectTo = `${appUrl.replace(/\/$/, "")}/auth`;
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (error) throw new Error(error.message);
  return data.user?.id ?? null;
}

export async function saveBillingEvent(params: {
  providerEventId: string;
  provider: "kiwify";
  email: string | null;
  status: string;
  payload: unknown;
}) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("billing_events").upsert({
    provider_event_id: params.providerEventId,
    provider: params.provider,
    customer_email: params.email,
    event_status: params.status,
    payload: params.payload,
  });

  if (error) throw new Error(error.message);
}

export async function applyBillingToUser(params: {
  userId: string;
  billingStatus: BillingStatus;
  email?: string | null;
  providerRef?: string | null;
}) {
  const adminClient = createAdminClient();
  const isAuthorized = isPaymentActive(params.billingStatus);

  const { error } = await adminClient.from("profiles").upsert({
    id: params.userId,
    billing_status: params.billingStatus,
    is_authorized: isAuthorized,
    billing_provider: "kiwify",
    billing_provider_ref: params.providerRef ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

