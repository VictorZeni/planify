"use client";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Ops, algo deu errado</h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">Ocorreu um erro inesperado. Tente novamente.</p>
        <p className="mt-2 text-xs text-[var(--app-text-muted)]">{error.message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--app-primary-strong)]"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-lg border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}

