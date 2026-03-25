import { createClient } from "@/lib/supabase/server";
import {
  apiError,
  apiForbidden,
  apiUnauthorized,
} from "@/lib/server/api-response";
import { resolveAccess } from "@/lib/server/access-state";

type AccessOptions = {
  requireAuthorized?: boolean;
  requireAdmin?: boolean;
};

export async function requireApiAccess(options: AccessOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { errorResponse: apiUnauthorized() };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_authorized, is_admin, billing_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { errorResponse: apiError(profileError.message, 400) };
  }

  const { isAuthorized, isAdmin, billingStatus, isAuthorizedByPayment } = resolveAccess(profile);

  if (options.requireAuthorized && !isAuthorized) {
    return {
      errorResponse: apiForbidden(
        "Acesso restrito. Entre em contato para liberação.",
      ),
    };
  }

  if (options.requireAdmin && !isAdmin) {
    return { errorResponse: apiForbidden("Forbidden") };
  }

  return {
    supabase,
    user,
    access: { isAuthorized, isAdmin, billingStatus, isAuthorizedByPayment },
  };
}

