"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDailyMotivation } from "@/hooks/use-daily-motivation";
import { Button } from "@/components/ui/button";

export function MotivationModal() {
  const { open, phrase, close } = useDailyMotivation();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="w-full max-w-lg rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-xl"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Motivação do dia</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-text)]">{phrase}</h2>
            <p className="mt-3 text-sm text-[var(--app-text-muted)]">
              Vamos manter consistência. Pequenas ações hoje viram resultados grandes no tempo.
            </p>
            <Button type="button" onClick={close} variant="primary" className="mt-6">
              Vamos começar
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

