import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const adminGuard = await requireAdminApi();
  if ("errorResponse" in adminGuard) {
    return adminGuard.errorResponse;
  }

  const adminClient = createAdminClient();

  const [{ data: usersData, error: usersError }, { data: profilesData, error: profilesError }] =
    await Promise.all([
      adminClient.auth.admin.listUsers(),
      adminClient
        .from("profiles")
        .select("id, display_name, is_authorized, is_admin, billing_status, updated_at")
        .order("updated_at", { ascending: false }),
    ]);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 400 });
  }

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 400 });
  }

  const usersById = new Map((usersData.users ?? []).map((user) => [user.id, user]));
  const response = (profilesData ?? []).map((profile) => {
    const authUser = usersById.get(profile.id);
    return {
      id: profile.id,
      email: authUser?.email ?? "",
      displayName: profile.display_name ?? authUser?.email?.split("@")[0] ?? "UsuÃ¡rio",
      isAuthorized: profile.is_authorized ?? false,
      isAdmin: profile.is_admin ?? false,
      billingStatus: profile.billing_status ?? "inactive",
      updatedAt: profile.updated_at ?? null,
    };
  });

  return NextResponse.json({ data: response });
}

