type ProgressPoint = {
  label: string;
  value: number;
};

type ProgressBarsProps = {
  title: string;
  points: ProgressPoint[];
};

export function ProgressBars({ title, points }: ProgressBarsProps) {
  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--app-text)]">{title}</h2>
      <div className="mt-4 space-y-3">
        {points.map((point) => (
          <div key={point.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-[var(--app-text-muted)]">
              <span>{point.label}</span>
              <span>{point.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--app-surface-soft)]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[#4ade80] transition-all duration-500"
                style={{ width: `${point.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

