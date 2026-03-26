import { describe, it, expect } from "vitest";
import {
  contrastRatio,
  meetsWcagAA,
  meetsWcagAAA,
  meetsUiComponentContrast,
  parseColor,
  isValidColor,
  suggestAccessibleColor,
  formatContrastRatio,
} from "../src/utils/color-math.js";

describe("contrastRatio", () => {
  it("returns 21:1 for black on white", () => {
    const ratio = contrastRatio("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for same colors", () => {
    const ratio = contrastRatio("#ffffff", "#ffffff");
    expect(ratio).toBeCloseTo(1, 0);
  });

  it("calculates known contrast ratios", () => {
    // gray-400 (#9ca3af) on white (#ffffff) = ~2.9:1
    const ratio = contrastRatio("#9ca3af", "#ffffff");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeGreaterThan(2.5);
    expect(ratio!).toBeLessThan(3.5);
  });

  it("handles rgb() colors", () => {
    const ratio = contrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("handles hsl() colors", () => {
    const ratio = contrastRatio("hsl(0, 0%, 0%)", "hsl(0, 0%, 100%)");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("handles named colors", () => {
    const ratio = contrastRatio("black", "white");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns null for invalid colors", () => {
    expect(contrastRatio("notacolor", "#ffffff")).toBeNull();
  });
});

describe("meetsWcagAA", () => {
  it("passes normal text at 4.5:1", () => {
    expect(meetsWcagAA(4.5, false)).toBe(true);
  });

  it("fails normal text at 4.4:1", () => {
    expect(meetsWcagAA(4.4, false)).toBe(false);
  });

  it("passes large text at 3.0:1", () => {
    expect(meetsWcagAA(3.0, true)).toBe(true);
  });

  it("fails large text at 2.9:1", () => {
    expect(meetsWcagAA(2.9, true)).toBe(false);
  });
});

describe("meetsWcagAAA", () => {
  it("passes normal text at 7.0:1", () => {
    expect(meetsWcagAAA(7.0, false)).toBe(true);
  });

  it("fails normal text at 6.9:1", () => {
    expect(meetsWcagAAA(6.9, false)).toBe(false);
  });

  it("passes large text at 4.5:1", () => {
    expect(meetsWcagAAA(4.5, true)).toBe(true);
  });
});

describe("meetsUiComponentContrast", () => {
  it("passes at 3.0:1", () => {
    expect(meetsUiComponentContrast(3.0)).toBe(true);
  });

  it("fails at 2.9:1", () => {
    expect(meetsUiComponentContrast(2.9)).toBe(false);
  });
});

describe("parseColor", () => {
  it("parses hex colors", () => {
    const rgb = parseColor("#ff0000");
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses short hex", () => {
    const rgb = parseColor("#f00");
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses named colors", () => {
    const rgb = parseColor("red");
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid colors", () => {
    expect(parseColor("notacolor")).toBeNull();
  });
});

describe("isValidColor", () => {
  it("validates hex colors", () => {
    expect(isValidColor("#ff0000")).toBe(true);
    expect(isValidColor("#000")).toBe(true);
  });

  it("validates named colors", () => {
    expect(isValidColor("red")).toBe(true);
    expect(isValidColor("black")).toBe(true);
  });

  it("rejects invalid colors", () => {
    expect(isValidColor("notacolor")).toBe(false);
  });
});

describe("suggestAccessibleColor", () => {
  it("returns original if already accessible", () => {
    const result = suggestAccessibleColor("#000000", "#ffffff");
    expect(result).toBe("#000000");
  });

  it("suggests a darker color for light backgrounds", () => {
    const result = suggestAccessibleColor("#9ca3af", "#ffffff");
    expect(result).not.toBeNull();
    if (result) {
      const ratio = contrastRatio(result, "#ffffff");
      expect(ratio).not.toBeNull();
      expect(ratio!).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("formatContrastRatio", () => {
  it("formats ratio with one decimal", () => {
    expect(formatContrastRatio(4.5)).toBe("4.5:1");
    expect(formatContrastRatio(21)).toBe("21.0:1");
  });
});
