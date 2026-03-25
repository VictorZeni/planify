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
  cpf?: string;
  customer_cpf?: string;
  document?: string;
  customer_document?: string;
  tax_id?: string;
  customer?: { email?: string; cpf?: string; document?: string; tax_id?: string };
  product_name?: string;
  product?: { name?: string };
  signature?: string;
  order?: {
    order_id?: string | number;
    order_ref?: string;
    order_status?: string;
    webhook_event_type?: string;
    Product?: { product_name?: string };
    Customer?: {
      email?: string;
      CPF?: string;
      cpf?: string;
      document?: string;
      tax_id?: string;
    };
  };
};

function hash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function sameToken(left: string, right: string) {
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function hmacSha1Hex(input: string, secret: string) {
  return crypto.createHmac("sha1", secret).update(input).digest("hex");
}

export function verifyKiwifyWebhook(
  request: Request,
  rawPayload?: string,
  payload?: unknown,
) {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;
  if (!secret) return true;

  const parsedPayload =
    payload && typeof payload === "object" ? (payload as KiwifyPayload) : null;

  const queryToken = (() => {
    try {
      const url = new URL(request.url);
      return (
        url.searchParams.get("token") ??
        url.searchParams.get("webhook_token") ??
        url.searchParams.get("key") ??
        null
      );
    } catch {
      return null;
    }
  })();

  const headerToken =
    request.headers.get("x-kiwify-token") ??
    request.headers.get("x-webhook-token") ??
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;

  if (headerToken && sameToken(headerToken, secret)) {
    return true;
  }

  if (queryToken && sameToken(queryToken, secret)) {
    return true;
  }

  const providedSignature =
    request.headers.get("x-kiwify-signature") ??
    request.headers.get("x-signature") ??
    parsedPayload?.signature ??
    null;

  if (!providedSignature || !rawPayload) {
    return false;
  }

  const sig = providedSignature.toLowerCase();
  const checks: string[] = [hmacSha1Hex(rawPayload, secret)];

  if (parsedPayload?.order && typeof parsedPayload.order === "object") {
    const orderJson = JSON.stringify(parsedPayload.order);
    checks.push(hmacSha1Hex(orderJson, secret));
  }

  return checks.some((expected) => expected === sig);
}

export function normalizeKiwifyPayload(payload: KiwifyPayload) {
  const orderCustomer = payload.order?.Customer;
  const orderData = payload.order;

  const email =
    payload.email ??
    payload.customer_email ??
    orderCustomer?.email ??
    payload.customer?.email ??
    null;

  const rawStatus =
    orderData?.webhook_event_type ??
    orderData?.order_status ??
    payload.payment_status ??
    payload.status ??
    payload.event ??
    "unknown";

  const status = String(rawStatus).toLowerCase();
  const cpf = normalizeCpf(
    payload.cpf ??
    payload.customer_cpf ??
    payload.document ??
    payload.customer_document ??
    payload.tax_id ??
    orderCustomer?.CPF ??
    orderCustomer?.cpf ??
    orderCustomer?.document ??
    orderCustomer?.tax_id ??
    payload.customer?.cpf ??
    payload.customer?.document ??
    payload.customer?.tax_id ??
    null,
  );
  const externalEventId = String(
    payload.id ??
      orderData?.order_id ??
      payload.order_id ??
      payload.orderId ??
      payload.transaction_id ??
      payload.transactionId ??
      hash(JSON.stringify(payload)),
  );

  const orderRef = String(
    orderData?.order_ref ??
      payload.order_id ??
      payload.orderId ??
      payload.transaction_id ??
      payload.transactionId ??
      "",
  );
  const productName = orderData?.Product?.product_name ?? payload.product_name ?? payload.product?.name ?? null;

  return {
    email,
    cpf,
    status,
    externalEventId,
    orderRef,
    productName,
  };
}

function normalizeCpf(value: string | null | undefined) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 11 ? digits : null;
}

export function mapKiwifyStatusToBilling(status: string): BillingStatus {
  const normalized = status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const activeStatuses = new Set([
    "paid",
    "approved",
    "completed",
    "charge_approved",
    "active",
    "compra_aprovada",
    "purchase_approved",
    "order_approved",
    "assinatura_renovada",
    "subscription_renewed",
  ]);

  if (activeStatuses.has(normalized)) {
    return "active";
  }

  const canceledStatuses = new Set([
    "refunded",
    "refund",
    "canceled",
    "cancelled",
    "chargeback",
    "reembolso",
    "assinatura_cancelada",
    "subscription_canceled",
  ]);

  if (canceledStatuses.has(normalized)) {
    return "canceled";
  }

  const unpaidStatuses = new Set([
    "expired",
    "unpaid",
    "failed",
    "compra_recusada",
    "assinatura_atrasada",
    "subscription_past_due",
  ]);

  if (unpaidStatuses.has(normalized)) {
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

export async function findUserIdByCpf(cpf: string) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .select("id")
    .eq("cpf", cpf)
    .maybeSingle();

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("column") && message.includes("cpf")) {
      console.warn("[kiwify-webhook] profiles.cpf column not found. Skipping CPF validation.");
      return null;
    }
    throw new Error(error.message);
  }

  return data?.id ?? null;
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
  if (!isTransactionalEmailConfigured()) {
    console.warn("[kiwify-email] SMTP not configured. Skipping post-purchase emails.");
    return;
  }

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
    `Use este link para ir para a pagina de acesso:\n${loginRedirectUrl}\n\n` +
    `Importante: use o mesmo e-mail da compra (${params.email}).\n` +
    `Se for seu primeiro acesso, aceite o convite enviado pelo sistema para criar sua senha.`;

  const accessHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Seu acesso esta pronto</h2>
      <p>Seu pagamento foi aprovado. Clique no botao abaixo para ir para a pagina de login.</p>
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
  cpf?: string | null;
  status: string;
  payload: unknown;
}) {
  const adminClient = createAdminClient();
  const insertPayload = {
    provider_event_id: params.providerEventId,
    provider: params.provider,
    customer_email: params.email,
    customer_cpf: params.cpf ?? null,
    event_status: params.status,
    payload: params.payload,
  };

  const { error } = await adminClient.from("billing_events").upsert(insertPayload);

  if (!error) return;

  const message = error.message.toLowerCase();
  if (message.includes("customer_cpf")) {
    const fallbackPayload = {
      provider_event_id: params.providerEventId,
      provider: params.provider,
      customer_email: params.email,
      event_status: params.status,
      payload: params.payload,
    };
    const { error: fallbackError } = await adminClient.from("billing_events").upsert(fallbackPayload);
    if (!fallbackError) return;
    throw new Error(fallbackError.message);
  }

  throw new Error(error.message);
}

export async function applyBillingToUser(params: {
  userId: string;
  billingStatus: BillingStatus;
  email?: string | null;
  cpf?: string | null;
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

  if (!params.cpf) return;

  const { error: cpfError } = await adminClient
    .from("profiles")
    .update({
      cpf: params.cpf,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.userId)
    .is("cpf", null);

  if (cpfError) {
    const message = cpfError.message.toLowerCase();
    if (message.includes("column") && message.includes("cpf")) {
      console.warn("[kiwify-webhook] profiles.cpf column not found. Skipping CPF persistence.");
      return;
    }
    throw new Error(cpfError.message);
  }
}


