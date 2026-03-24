import { AppShell } from "@/components/layout/app-shell";
import { ModuleCard } from "@/components/modules/module-card";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { requireUserContext } from "@/lib/server/require-user";
import { PLANIFY_MODULES } from "@/lib/modules";

export default async function ModulesPage() {
  const { userCard } = await requireUserContext();

  return (
    <AppShell user={userCard}>
      <PageWrapper>
        <header className="planify-surface p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Planify</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Dashboard de Módulos</h1>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            Acesse os módulos de produtividade e evolua com consistência.
          </p>
        </header>

        <section className="rounded-xl border border-[var(--app-border)] bg-white p-4 shadow-sm md:p-6">
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
      </PageWrapper>
    </AppShell>
  );
}

