export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-[var(--app-text-muted)]">Carregando...</p>
      </div>
    </main>
  );
}

