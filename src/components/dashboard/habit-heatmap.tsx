type HeatmapPoint = {
  day: string;
  value: number;
};

type HabitHeatmapProps = {
  points: HeatmapPoint[];
};

function colorByValue(value: number) {
  if (value === 0) return "bg-slate-800";
  if (value === 1) return "bg-cyan-900";
  if (value === 2) return "bg-cyan-700";
  if (value === 3) return "bg-cyan-500";
  return "bg-cyan-300";
}

export function HabitHeatmap({ points }: HabitHeatmapProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Heatmap de consistencia</h2>
      <p className="mt-1 text-xs text-slate-300">
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
