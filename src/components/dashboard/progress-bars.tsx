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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {points.map((point) => (
          <div key={point.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
              <span>{point.label}</span>
              <span>{point.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300 transition-all duration-500"
                style={{ width: `${point.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
