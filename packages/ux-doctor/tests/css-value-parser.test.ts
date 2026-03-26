import { describe, it, expect } from "vitest";
import {
  parseCssSize,
  toPx,
  isLargeText,
  parseLineHeight,
  extractCssVarName,
  isCssColor,
} from "../src/utils/css-value-parser.js";

describe("parseCssSize", () => {
  it("parses px values", () => {
    expect(parseCssSize("16px")).toEqual({ value: 16, unit: "px" });
    expect(parseCssSize("1.5px")).toEqual({ value: 1.5, unit: "px" });
  });

  it("parses rem values", () => {
    expect(parseCssSize("1rem")).toEqual({ value: 1, unit: "rem" });
    expect(parseCssSize("0.875rem")).toEqual({ value: 0.875, unit: "rem" });
  });

  it("parses em values", () => {
    expect(parseCssSize("2em")).toEqual({ value: 2, unit: "em" });
  });

  it("parses % values", () => {
    expect(parseCssSize("100%")).toEqual({ value: 100, unit: "%" });
  });

  it("returns null for invalid values", () => {
    expect(parseCssSize("auto")).toBeNull();
    expect(parseCssSize("")).toBeNull();
    expect(parseCssSize("16")).toBeNull();
  });
});

describe("toPx", () => {
  it("converts px to px", () => {
    expect(toPx({ value: 16, unit: "px" })).toBe(16);
  });

  it("converts rem to px with default base", () => {
    expect(toPx({ value: 1, unit: "rem" })).toBe(16);
    expect(toPx({ value: 0.875, unit: "rem" })).toBe(14);
  });

  it("converts em to px", () => {
    expect(toPx({ value: 2, unit: "em" })).toBe(32);
  });

  it("returns null for unconvertible units", () => {
    expect(toPx({ value: 100, unit: "%" })).toBeNull();
    expect(toPx({ value: 50, unit: "vw" })).toBeNull();
  });
});

describe("isLargeText", () => {
  it("18px+ is large text", () => {
    expect(isLargeText(18)).toBe(true);
    expect(isLargeText(24)).toBe(true);
  });

  it("14px+ bold is large text", () => {
    expect(isLargeText(14, true)).toBe(true);
    expect(isLargeText(16, true)).toBe(true);
  });

  it("small text is not large", () => {
    expect(isLargeText(12)).toBe(false);
    expect(isLargeText(16)).toBe(false);
  });

  it("13px bold is not large", () => {
    expect(isLargeText(13, true)).toBe(false);
  });
});

describe("parseLineHeight", () => {
  it("parses unitless values", () => {
    expect(parseLineHeight("1.5")).toBe(1.5);
    expect(parseLineHeight("2")).toBe(2);
  });

  it("parses 'normal' as 1.2", () => {
    expect(parseLineHeight("normal")).toBe(1.2);
  });

  it("parses px values relative to font size", () => {
    expect(parseLineHeight("24px", 16)).toBe(1.5);
    expect(parseLineHeight("32px", 16)).toBe(2);
  });
});

describe("extractCssVarName", () => {
  it("extracts variable name", () => {
    expect(extractCssVarName("var(--color-primary)")).toEqual({
      varName: "--color-primary",
      fallback: null,
    });
  });

  it("extracts variable with fallback", () => {
    expect(extractCssVarName("var(--color-primary, #3b82f6)")).toEqual({
      varName: "--color-primary",
      fallback: "#3b82f6",
    });
  });

  it("returns null for non-var values", () => {
    expect(extractCssVarName("#ff0000")).toBeNull();
    expect(extractCssVarName("red")).toBeNull();
  });
});

describe("isCssColor", () => {
  it("detects hex colors", () => {
    expect(isCssColor("#ff0000")).toBe(true);
    expect(isCssColor("#f00")).toBe(true);
    expect(isCssColor("#ff000080")).toBe(true);
  });

  it("detects rgb/rgba", () => {
    expect(isCssColor("rgb(255, 0, 0)")).toBe(true);
    expect(isCssColor("rgba(255, 0, 0, 0.5)")).toBe(true);
  });

  it("detects hsl/hsla", () => {
    expect(isCssColor("hsl(0, 100%, 50%)")).toBe(true);
    expect(isCssColor("hsla(0, 100%, 50%, 0.5)")).toBe(true);
  });

  it("detects oklch", () => {
    expect(isCssColor("oklch(0.72 0.11 178)")).toBe(true);
  });

  it("detects named colors", () => {
    expect(isCssColor("red")).toBe(true);
    expect(isCssColor("rebeccapurple")).toBe(true);
  });

  it("detects transparent", () => {
    expect(isCssColor("transparent")).toBe(true);
  });

  it("rejects non-colors", () => {
    expect(isCssColor("auto")).toBe(false);
    expect(isCssColor("inherit")).toBe(false);
    expect(isCssColor("16px")).toBe(false);
    expect(isCssColor("var(--color)")).toBe(false);
  });
});
