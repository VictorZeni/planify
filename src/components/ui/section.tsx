import { Card } from "./card";

type SectionProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Section({ title, subtitle, right, children, className }: SectionProps) {
  return (
    <Card className={className}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[var(--app-text-muted)]">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}

