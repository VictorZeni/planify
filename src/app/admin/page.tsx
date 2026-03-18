import { AppShell } from "@/components/layout/app-shell";
import { requireUserContext } from "@/lib/server/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminClient, type AdminUser } from "./admin-client";

export default async function AdminPage() {
  const { userCard } = await requireUserContext();
  const adminClient = createAdminClient();

  const [{ data: usersData }, { data: profilesData }] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient
      .from("profiles")
      .select("id, display_name, is_authorized, is_admin, updated_at")
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
      updatedAt: profile.updated_at ?? null,
    };
  });

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Planify Admin</p>
          <h1 className="mt-2 text-2xl font-bold">Gestao de acesso</h1>
          <p className="mt-1 text-sm text-slate-300">
            Controle manual de autorizacao para usuarios internos e pagantes.
          </p>
        </header>

        <AdminClient initialUsers={initialUsers} />
      </div>
    </AppShell>
  );
}
