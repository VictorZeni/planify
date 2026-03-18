"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Modo Foco</p>
        <h1 className="mt-3 text-2xl font-bold">{taskTitle}</h1>
        <p className="mt-2 text-sm text-slate-300">Agora só existe essa tarefa.</p>

        <p className="mt-8 text-6xl font-black tracking-tight text-cyan-300">{timeLabel}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
          >
            {running ? "Pausar" : "Retomar"}
          </button>
          <button
            type="button"
            onClick={() => setSecondsLeft(initialMinutes * 60)}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
          >
            Reiniciar
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-rose-700 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-500"
          >
            Encerrar antes
          </button>
        </div>

          <button
            type="button"
            onClick={() => void completeTask()}
            className="mt-6 rounded-lg bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Concluir tarefa
          </button>

        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
      </motion.section>
    </main>
  );
}
