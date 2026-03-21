type LineProductivityChartProps = {
  title?: string;
  subtitle?: string;
  points: Array<{
    day: string;
    value: number;
  }>;
};

export function LineProductivityChart({
  title = "Produtividade diária",
  subtitle = "Tarefas concluídas nos últimos 14 dias",
  points,
}: LineProductivityChartProps) {
  const width = 720;
  const height = 220;
  const padding = 24;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const path = points
    .map((point, index) => {
      const x =
        padding + (index / Math.max(points.length - 1, 1)) * chartWidth;
      const y =
        padding + chartHeight - (point.value / maxValue) * chartHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{title}</p>
      <p className="mt-2 text-sm text-slate-300">{subtitle}</p>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-56 min-w-[640px] w-full"
          role="img"
          aria-label="Gráfico de linha de produtividade"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = padding + chartHeight * step;
            return (
              <line
                key={step}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="1"
              />
            );
          })}

          <path
            d={path}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {points.map((point, index) => {
            const x =
              padding + (index / Math.max(points.length - 1, 1)) * chartWidth;
            const y =
              padding + chartHeight - (point.value / maxValue) * chartHeight;
            return (
              <g key={point.day}>
                <circle cx={x} cy={y} r="3.5" fill="#22D3EE" />
                {index % 3 === 0 || index === points.length - 1 ? (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                  >
                    {point.day.slice(5)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

