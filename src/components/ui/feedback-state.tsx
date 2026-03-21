type LoadingStateProps = {
  text?: string;
};

type AlertStateProps = {
  text: string;
  tone?: "info" | "success" | "error";
};

export function LoadingState({ text = "Carregando..." }: LoadingStateProps) {
  return <p className="text-sm text-slate-300">{text}</p>;
}

export function AlertState({ text, tone = "info" }: AlertStateProps) {
  const toneClass =
    tone === "error"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
      : tone === "success"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
        : "border-slate-700 bg-slate-950 text-slate-200";

  return <p className={`rounded-lg border p-3 text-sm ${toneClass}`}>{text}</p>;
}

