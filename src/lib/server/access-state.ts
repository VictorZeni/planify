import { type BillingStatus, isPaymentActive } from "@/lib/server/billing-status";

type AccessProfile = {
  is_admin?: boolean | null;
  is_authorized?: boolean | null;
  billing_status?: string | null;
};

export function resolveAccess(profile: AccessProfile | null | undefined) {
  const isAdmin = profile?.is_admin ?? false;
  const billingStatus = (profile?.billing_status ?? "inactive") as BillingStatus;
  const isAuthorizedByPayment = isPaymentActive(billingStatus);

  // Optional escape hatch for migration/legacy support, disabled by default.
  const allowLegacyManualAuth = process.env.ALLOW_LEGACY_MANUAL_AUTH === "true";
  const legacyManualAuthorized = allowLegacyManualAuth && (profile?.is_authorized ?? false);

  return {
    isAdmin,
    billingStatus,
    isAuthorized: isAdmin || isAuthorizedByPayment || legacyManualAuthorized,
    isAuthorizedByPayment,
  };
}
