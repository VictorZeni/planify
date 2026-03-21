import { NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import {
  applyBillingToUser,
  findUserIdByEmail,
  inviteUserForAccess,
  mapKiwifyStatusToBilling,
  normalizeKiwifyPayload,
  saveBillingEvent,
  verifyKiwifyWebhook,
} from "@/lib/server/kiwify";

export async function POST(request: Request) {
  const rawPayload = await request.text();
  if (!verifyKiwifyWebhook(request)) {
    return apiError("Invalid Kiwify webhook signature", 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return apiError("Invalid JSON payload", 400);
  }

  const normalized = normalizeKiwifyPayload(payload);
  await saveBillingEvent({
    providerEventId: normalized.externalEventId,
    provider: "kiwify",
    email: normalized.email,
    status: normalized.status,
    payload,
  });

  if (!normalized.email) {
    return NextResponse.json({ ok: true, skipped: "missing_email" });
  }

  const billingStatus = mapKiwifyStatusToBilling(normalized.status);
  let userId = await findUserIdByEmail(normalized.email);

  if (!userId && billingStatus === "active") {
    userId = await inviteUserForAccess(normalized.email);
  }

  if (!userId) {
    return NextResponse.json({ ok: true, queued: true });
  }

  await applyBillingToUser({
    userId,
    billingStatus,
    email: normalized.email,
    providerRef: normalized.orderRef || normalized.externalEventId,
  });

  return NextResponse.json({ ok: true });
}
