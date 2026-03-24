import { cn } from "@/lib/cn";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-primary)] focus:ring-[var(--app-primary-soft)]",
        className,
      )}
      {...props}
    />
  );
}

