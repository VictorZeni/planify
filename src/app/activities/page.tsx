import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const metaDisplayName =
    (user.user_metadata?.display_name as string | undefined) ??
    `${user.user_metadata?.first_name ?? ""} ${user.user_metadata?.last_name ?? ""}`.trim();
  const fallbackDisplayName = metaDisplayName || user.email?.split("@")[0] || "Usuario";

  const [{ data: profileData }, { data: tasks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, is_admin, is_authorized")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id, title, completed, completed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <AppShell
      user={{
        displayName: profileData?.display_name ?? fallbackDisplayName,
        email: user.email ?? "",
        avatarUrl: profileData?.avatar_url ?? null,
        isAdmin: profileData?.is_admin ?? false,
        isAuthorized: profileData?.is_authorized ?? false,
      }}
    >
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Atividades</p>
          <h1 className="mt-2 text-2xl font-bold">Historico recente</h1>
          <p className="mt-1 text-sm text-slate-300">
            Acompanhe conclusoes e andamento das suas tarefas.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-slate-300">
              <tr>
                <th className="px-4 py-3">Tarefa</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criada em</th>
                <th className="px-4 py-3">Concluida em</th>
              </tr>
            </thead>
            <tbody>
              {(tasks ?? []).map((task) => (
                <tr key={task.id} className="border-b border-white/5 text-slate-100">
                  <td className="px-4 py-3">{task.title}</td>
                  <td className="px-4 py-3">{task.completed ? "Concluida" : "Pendente"}</td>
                  <td className="px-4 py-3">
                    {new Date(task.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {task.completed_at
                      ? new Date(task.completed_at).toLocaleString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
