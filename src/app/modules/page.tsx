import { AppShell } from "@/components/layout/app-shell";
import { ModuleCard } from "@/components/modules/module-card";
import { requireUserContext } from "@/lib/server/require-user";
import { PLANIFY_MODULES } from "@/lib/modules";

export default async function ModulesPage() {
  const { userCard } = await requireUserContext();

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Planify</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">Modules Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">
            Acesse os módulos de produtividade e evolua com consistência.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLANIFY_MODULES.map((moduleItem, index) => (
              <ModuleCard
                key={moduleItem.route}
                title={moduleItem.title}
                description={moduleItem.description}
                route={moduleItem.route}
                delayMs={index * 70}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
