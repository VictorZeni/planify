import { describe, expect, it } from "vitest";
import { normalizePriority, priorityLabel } from "./priority";

describe("normalizePriority", () => {
  it("normaliza termos em portugues e ingles", () => {
    expect(normalizePriority("alta")).toBe("high");
    expect(normalizePriority("high")).toBe("high");
    expect(normalizePriority("baixa")).toBe("low");
    expect(normalizePriority("low")).toBe("low");
    expect(normalizePriority("media")).toBe("medium");
    expect(normalizePriority(undefined)).toBe("medium");
  });
});

describe("priorityLabel", () => {
  it("retorna label em portugues", () => {
    expect(priorityLabel("high")).toBe("Alta");
    expect(priorityLabel("medium")).toBe("Media");
    expect(priorityLabel("low")).toBe("Baixa");
  });
});

