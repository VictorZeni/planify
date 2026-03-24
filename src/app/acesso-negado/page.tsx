import Link from "next/link";
import Image from "next/image";

export default function AcessoNegadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-xl rounded-xl border border-red-200 bg-white p-8 shadow-sm">
        <Image src="/planify-logo.svg" alt="Planify" width={220} height={60} className="h-auto w-40 object-contain" priority />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--app-danger-text)]">Acesso restrito</p>
        <h1 className="mt-2 text-2xl font-semibold">Você não tem permissão para entrar aqui</h1>
        <p className="mt-3 text-sm text-[var(--app-text-muted)]">
          Sua conta ainda não está liberada para esta área. Entre em contato com o administrador.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-lg border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]"
          >
            Voltar ao painel
          </Link>
          <Link
            href="/pagamento"
            className="inline-flex h-10 items-center rounded-lg bg-[var(--app-primary)] px-4 text-sm font-medium text-white transition-all hover:bg-[var(--app-primary-strong)]"
          >
            Ver planos de acesso
          </Link>
        </div>
      </section>
    </main>
  );
}

