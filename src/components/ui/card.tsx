import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

