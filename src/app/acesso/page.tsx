import Image from "next/image";
import Link from "next/link";

type AcessoPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function AcessoPage({ searchParams }: AcessoPageProps) {
  const params = await searchParams;
  const loginHref = params.email ? `/auth?email=${encodeURIComponent(params.email)}` : "/auth";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-2xl rounded-xl border border-[var(--app-border)] bg-white p-8 shadow-sm">
        <Image src="/planify-logo.svg" alt="Planify" width={220} height={60} className="h-auto w-40 object-contain" priority />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Acesso liberado</p>
        <h1 className="mt-2 text-2xl font-semibold">Entrar no Planify</h1>
        <p className="mt-3 text-sm text-[var(--app-text-muted)]">
          Seu pagamento foi confirmado. Clique abaixo para continuar para a tela de login.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm text-[var(--app-text)]">
          <p>Use o mesmo e-mail da compra para entrar.</p>
          <p className="mt-2">Se for seu primeiro acesso, confirme o convite recebido por e-mail para criar sua senha.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={loginHref} className="inline-flex h-10 items-center rounded-lg bg-[var(--app-primary)] px-4 text-sm font-medium text-white transition-all hover:bg-[var(--app-primary-strong)]">
            Ir para login
          </Link>
          <Link href="/compra-confirmada" className="inline-flex h-10 items-center rounded-lg border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]">
            Ver instruções
          </Link>
        </div>
      </section>
    </main>
  );
}
