"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDailyMotivation } from "@/hooks/use-daily-motivation";

export function MotivationModal() {
  const { open, phrase, close } = useDailyMotivation();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/85 p-6 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Motivação do dia</p>
            <h2 className="mt-3 text-2xl font-bold text-white">{phrase}</h2>
            <p className="mt-3 text-sm text-slate-300">
              Vamos manter consistência. Pequenas ações hoje viram resultados grandes no tempo.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={close}
              className="mt-6 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Vamos começar
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
