type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-xl border border-[var(--app-border)] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--app-text-muted)]">{hint}</p>
    </article>
  );
}

