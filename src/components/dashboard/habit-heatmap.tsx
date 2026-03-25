type HeatmapPoint = {
  day: string;
  value: number;
};

type HabitHeatmapProps = {
  points: HeatmapPoint[];
};

function colorByValue(value: number) {
  if (value === 0) return "bg-[#edf2ee]";
  if (value === 1) return "bg-[#bbf7d0]";
  if (value === 2) return "bg-[#86efac]";
  if (value === 3) return "bg-[#4ade80]";
  return "bg-[#22c55e]";
}

export function HabitHeatmap({ points }: HabitHeatmapProps) {
  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--app-text)]">Heatmap de consistência</h2>
      <p className="mt-1 text-xs text-[var(--app-text-muted)]">
        Intensidade baseada em conclusoes diarias.
      </p>
      <div className="mt-4 grid grid-cols-14 gap-1">
        {points.map((point) => (
          <div
            key={point.day}
            title={`${point.day}: ${point.value} conclusoes`}
            className={`h-4 w-4 rounded-sm ${colorByValue(point.value)}`}
          />
        ))}
      </div>
    </section>
  );
}

