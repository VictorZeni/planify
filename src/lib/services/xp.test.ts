import { describe, expect, it } from "vitest";
import { calculateXP, levelFromXp } from "./xp";

describe("calculateXP", () => {
  it("aplica XP por prioridade", () => {
    expect(calculateXP({ priority: "low", dueAt: null })).toBe(10);
    expect(calculateXP({ priority: "medium", dueAt: null })).toBe(25);
    expect(calculateXP({ priority: "high", dueAt: null })).toBe(50);
  });

  it("aplica bonus quando prazo estiver em ate 48h", () => {
    const completedAt = new Date("2026-03-21T10:00:00.000Z");
    const dueAt = "2026-03-22T10:00:00.000Z";
    expect(calculateXP({ priority: "high", dueAt }, completedAt)).toBe(70);
  });
});

describe("levelFromXp", () => {
  it("calcula nivel e progresso", () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      xpInCurrentLevel: 0,
      progressPercent: 0,
    });

    expect(levelFromXp(260)).toEqual({
      level: 2,
      xpInCurrentLevel: 10,
      progressPercent: 4,
    });
  });
});

