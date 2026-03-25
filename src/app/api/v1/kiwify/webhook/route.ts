import { NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import {
  applyBillingToUser,
  findUserIdByCpf,
  findUserIdByEmail,
  inviteUserForAccess,
  mapKiwifyStatusToBilling,
  normalizeKiwifyPayload,
  saveBillingEvent,
  sendPostPurchaseEmails,
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
    cpf: normalized.cpf,
    status: normalized.status,
    payload,
  });

  const billingStatus = mapKiwifyStatusToBilling(normalized.status);
  let userId = normalized.email ? await findUserIdByEmail(normalized.email) : null;

  if (!userId && normalized.cpf) {
    userId = await findUserIdByCpf(normalized.cpf);
  }

  if (!userId && normalized.email && billingStatus === "active") {
    userId = await inviteUserForAccess(normalized.email);
  }

  if (!userId) {
    return NextResponse.json({ ok: true, queued: true });
  }

  await applyBillingToUser({
    userId,
    billingStatus,
    email: normalized.email,
    cpf: normalized.cpf,
    providerRef: normalized.orderRef || normalized.externalEventId,
  });

  if (billingStatus === "active" && normalized.email) {
    try {
      await sendPostPurchaseEmails({
        email: normalized.email,
        productName: normalized.productName,
        orderRef: normalized.orderRef || normalized.externalEventId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      console.error("[kiwify-webhook] failed to send purchase emails:", message);
    }
  }

  return NextResponse.json({ ok: true });
}

