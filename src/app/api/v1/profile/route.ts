import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError, apiValidationError } from "@/lib/server/api-response";

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  firstName: z.string().trim().min(2).max(40).optional(),
  lastName: z.string().trim().min(2).max(60).optional(),
  gender: z.enum(["masculino", "feminino", "outro", "nao_informar"]).optional(),
});

export async function GET() {
  const access = await requireApiAccess();
  if ("errorResponse" in access) return access.errorResponse;
  const { supabase, user } = access;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "display_name, first_name, last_name, gender, avatar_url, is_authorized, is_admin, billing_status",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return apiError(error.message, 400);
  }

  return NextResponse.json({
    data: {
      email: user.email,
      displayName: data?.display_name ?? user.email?.split("@")[0] ?? "Usuario",
      firstName: data?.first_name ?? null,
      lastName: data?.last_name ?? null,
      gender: data?.gender ?? "nao_informar",
      avatarUrl: data?.avatar_url ?? null,
      isAuthorized: data?.is_authorized ?? false,
      isAdmin: data?.is_admin ?? false,
      billingStatus: data?.billing_status ?? "inactive",
    },
  });
}

export async function PATCH(request: Request) {
  const access = await requireApiAccess();
  if ("errorResponse" in access) return access.errorResponse;
  const { supabase, user } = access;

  const payload = await request.json();
  const parsed = updateProfileSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error.flatten());
  }

  const { displayName, firstName, lastName, gender } = parsed.data;
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    gender: gender ?? "nao_informar",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return apiError(error.message, 400);
  }

  return NextResponse.json({ data: { displayName, firstName, lastName, gender } });
}
