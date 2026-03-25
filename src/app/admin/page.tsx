import { AppShell } from "@/components/layout/app-shell";
import { requireUserContext } from "@/lib/server/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminClient, type AdminUser } from "./admin-client";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default async function AdminPage() {
  const { userCard } = await requireUserContext();
  const adminClient = createAdminClient();

  const [{ data: usersData }, { data: profilesData }] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient
      .from("profiles")
      .select("id, display_name, is_authorized, is_admin, billing_status, updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  const usersById = new Map((usersData.users ?? []).map((user) => [user.id, user]));
  const initialUsers: AdminUser[] = (profilesData ?? []).map((profile) => {
    const authUser = usersById.get(profile.id);
    return {
      id: profile.id,
      email: authUser?.email ?? "",
      displayName: profile.display_name ?? authUser?.email?.split("@")[0] ?? "Usuario",
      isAuthorized: profile.is_authorized ?? false,
      isAdmin: profile.is_admin ?? false,
      billingStatus: profile.billing_status ?? "inactive",
      updatedAt: profile.updated_at ?? null,
    };
  });

  const allowManualAuthorization = process.env.ALLOW_MANUAL_AUTHORIZATION === "true";

  return (
    <AppShell user={userCard}>
      <PageWrapper>
        <header className="planify-surface p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Planify Admin</p>
          <h1 className="mt-2 text-2xl font-semibold">Gestão de acesso</h1>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Controle manual de autorizacao para usuarios internos e pagantes.
          </p>
        </header>

        <AdminClient
          initialUsers={initialUsers}
          allowManualAuthorization={allowManualAuthorization}
        />
      </PageWrapper>
    </AppShell>
  );
}

