type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, right }: PageHeaderProps) {
  return (
    <header className="planify-surface flex items-start justify-between gap-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-[var(--app-text-muted)]">{description}</p> : null}
      </div>
      {right}
    </header>
  );
}

