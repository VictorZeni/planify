import crypto from "node:crypto";
import nodemailer from "nodemailer";
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

function getAppBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return baseUrl.replace(/\/$/, "");
}

function getDisplayNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "Cliente";
  if (!localPart) return "Cliente";
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function isTransactionalEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM,
  );
}

async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass || !from) {
    throw new Error("Missing SMTP configuration (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / EMAIL_FROM).");
  }

  const smtpPort = Number(smtpPortRaw);
  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    throw new Error("Invalid SMTP_PORT value.");
  }

  const smtpSecureEnv = process.env.SMTP_SECURE?.toLowerCase();
  const smtpSecure =
    smtpSecureEnv === "true" ||
    smtpSecureEnv === "1" ||
    (smtpSecureEnv !== "false" && smtpSecureEnv !== "0" && smtpPort === 465);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  });
}

export async function sendPostPurchaseEmails(params: {
  email: string;
  productName?: string | null;
  orderRef?: string | null;
}) {
  if (!isTransactionalEmailConfigured()) return;

  const appBaseUrl = getAppBaseUrl();
  const productLabel = params.productName?.trim() || "Planify";
  const orderText = params.orderRef?.trim() ? `Pedido: ${params.orderRef.trim()}` : "Pedido confirmado";
  const displayName = getDisplayNameFromEmail(params.email);
  const loginRedirectUrl = `${appBaseUrl}/acesso?email=${encodeURIComponent(params.email)}`;

  const confirmationSubject = `Compra confirmada - ${productLabel}`;
  const confirmationText =
    `Oi, ${displayName}! Sua compra foi confirmada com sucesso.\n` +
    `${orderText}\n\n` +
    `Em seguida, veja o e-mail com o link de acesso para entrar na plataforma.\n` +
    `Equipe Planify`;

  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Compra confirmada</h2>
      <p>Oi, <strong>${displayName}</strong>! Sua compra foi confirmada com sucesso.</p>
      <p><strong>${orderText}</strong></p>
      <p>Em seguida, veja o e-mail com o link de acesso para entrar na plataforma.</p>
      <p>Equipe Planify</p>
    </div>
  `;

  const accessSubject = "Acesse sua conta Planify";
  const accessText =
    `Seu pagamento foi aprovado.\n` +
    `Use este link para ir para a página de acesso:\n${loginRedirectUrl}\n\n` +
    `Importante: use o mesmo e-mail da compra (${params.email}).\n` +
    `Se for seu primeiro acesso, aceite o convite enviado pelo sistema para criar sua senha.`;

  const accessHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Seu acesso está pronto</h2>
      <p>Seu pagamento foi aprovado. Clique no botão abaixo para ir para a página de login.</p>
      <p style="margin: 20px 0;">
        <a href="${loginRedirectUrl}" style="background: #0ea5e9; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ir para o login
        </a>
      </p>
      <p>Importante: use o mesmo e-mail da compra (<strong>${params.email}</strong>).</p>
      <p>Se for seu primeiro acesso, aceite o convite enviado pelo sistema para criar sua senha.</p>
    </div>
  `;

  await sendTransactionalEmail({
    to: params.email,
    subject: confirmationSubject,
    html: confirmationHtml,
    text: confirmationText,
  });

  await sendTransactionalEmail({
    to: params.email,
    subject: accessSubject,
    html: accessHtml,
    text: accessText,
  });
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

