type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, right }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-300">{description}</p> : null}
      </div>
      {right}
    </header>
  );
}
