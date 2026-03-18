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
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">Ops, algo deu errado</h1>
        <p className="mt-2 text-sm text-slate-300">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <p className="mt-2 text-xs text-slate-500">{error.message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
