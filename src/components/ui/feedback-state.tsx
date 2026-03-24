type LoadingStateProps = {
  text?: string;
};

type AlertStateProps = {
  text: string;
  tone?: "info" | "success" | "error";
};

export function LoadingState({ text = "Carregando..." }: LoadingStateProps) {
  return <p className="text-sm text-[var(--app-text-muted)]">{text}</p>;
}

export function AlertState({ text, tone = "info" }: AlertStateProps) {
  const toneClass =
    tone === "error"
      ? "border-red-200 bg-[var(--app-danger-soft)] text-[var(--app-danger-text)]"
      : tone === "success"
        ? "border-green-200 bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
        : "border-[var(--app-border)] bg-[var(--app-surface-soft)] text-[var(--app-text)]";

  return <p className={`rounded-lg border p-3 text-sm ${toneClass}`}>{text}</p>;
}

