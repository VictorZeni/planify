"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type FocusModeClientProps = {
  taskId: string;
  taskTitle: string;
  initialMinutes?: number;
};

export function FocusModeClient({
  taskId,
  taskTitle,
  initialMinutes = 25,
}: FocusModeClientProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          setMessage("Sessão concluída. Finalize sua tarefa.");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const timeLabel = useMemo(() => {
    const min = Math.floor(secondsLeft / 60);
    const sec = secondsLeft % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }, [secondsLeft]);

  async function completeTask() {
    const response = await fetch(`/api/v1/tasks/${taskId}/complete`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Erro ao concluir tarefa.");
      return;
    }

    setMessage(`+${payload.data.xpGain} XP. Você evoluiu hoje.`);
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] p-6 text-[var(--app-text)]">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-2xl rounded-xl border border-[var(--app-border)] bg-white p-8 text-center shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Modo Foco</p>
        <h1 className="mt-3 text-2xl font-semibold">{taskTitle}</h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">Agora só existe essa tarefa.</p>

        <p className="mt-8 text-6xl font-semibold tracking-tight text-[var(--app-primary)]">{timeLabel}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => setRunning((v) => !v)}>
            {running ? "Pausar" : "Retomar"}
          </Button>
          <Button variant="secondary" onClick={() => setSecondsLeft(initialMinutes * 60)}>
            Reiniciar
          </Button>
          <Button variant="danger" onClick={() => router.push("/dashboard")}>
            Encerrar antes
          </Button>
        </div>

        <Button variant="primary" onClick={() => void completeTask()} className="mt-6">
          Concluir tarefa
        </Button>

        {message ? <p className="mt-4 text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
      </motion.section>
    </main>
  );
}

