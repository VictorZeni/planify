import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { getModuleBySlug } from "@/lib/modules";
import { requireUserContext } from "@/lib/server/require-user";
import { ModuleRuntime } from "./module-runtime";

type ModulePlaceholderPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModulePlaceholderPage({ params }: ModulePlaceholderPageProps) {
  const [{ userCard }, { slug }] = await Promise.all([requireUserContext(), params]);
  const moduleItem = getModuleBySlug(slug);

  if (!moduleItem) {
    notFound();
  }

  return (
    <AppShell user={userCard}>
      <PageWrapper maxWidth="4xl">
        <section className="rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Módulo</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{moduleItem.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--app-text-muted)]">{moduleItem.description}</p>
          <div className="mt-6">
            <ModuleRuntime slug={slug} />
          </div>
          <Link
            href="/modules"
            className="mt-6 inline-flex rounded-lg border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]"
          >
            Voltar para Dashboard de Módulos
          </Link>
        </section>
      </PageWrapper>
    </AppShell>
  );
}

