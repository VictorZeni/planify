"use client";

import { useEffect, useMemo, useState } from "react";
import { getPhraseForToday } from "@/lib/motivation/phrases";

const STORAGE_KEY_PREFIX = "smart_planner_motivation_seen_";

function todayKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${STORAGE_KEY_PREFIX}${yyyy}-${mm}-${dd}`;
}

export function useDailyMotivation() {
  const [open, setOpen] = useState(false);

  const phrase = useMemo(() => getPhraseForToday(), []);

  useEffect(() => {
    const key = todayKey();
    const seen = window.localStorage.getItem(key);
    if (!seen) {
      const timeout = window.setTimeout(() => setOpen(true), 0);
      return () => window.clearTimeout(timeout);
    }
  }, []);

  function close() {
    const key = todayKey();
    window.localStorage.setItem(key, "1");
    setOpen(false);
  }

  return { open, phrase, close };
}
