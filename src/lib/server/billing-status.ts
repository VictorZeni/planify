export type BillingStatus =
  | "manual"
  | "active"
  | "trialing"
  | "inactive"
  | "past_due"
  | "canceled"
  | "unpaid";

export function isPaymentActive(billingStatus: string | null | undefined) {
  return billingStatus === "active" || billingStatus === "trialing";
}

