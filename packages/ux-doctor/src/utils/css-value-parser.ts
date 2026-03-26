export interface CssSizeValue {
  value: number;
  unit: "px" | "rem" | "em" | "%" | "vw" | "vh" | "vmin" | "vmax" | "ch";
}

export const parseCssSize = (raw: string): CssSizeValue | null => {
  const trimmed = raw.trim();
  const match = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\s*(px|rem|em|%|vw|vh|vmin|vmax|ch)$/,
  );
  if (!match) return null;

  return {
    value: parseFloat(match[1]),
    unit: match[2] as CssSizeValue["unit"],
  };
};

export const toPx = (
  size: CssSizeValue,
  baseFontSizePx: number = 16,
): number | null => {
  switch (size.unit) {
    case "px":
      return size.value;
    case "rem":
      return size.value * baseFontSizePx;
    case "em":
      return size.value * baseFontSizePx;
    default:
      return null;
  }
};

export const isLargeText = (
  fontSizePx: number,
  isBold: boolean = false,
): boolean => {
  if (isBold) return fontSizePx >= 14;
  return fontSizePx >= 18;
};

export const parseLineHeight = (
  value: string,
  fontSizePx: number = 16,
): number | null => {
  const trimmed = value.trim();

  if (trimmed === "normal") return 1.2;

  const unitless = parseFloat(trimmed);
  if (!isNaN(unitless) && trimmed === String(unitless)) {
    return unitless;
  }

  const size = parseCssSize(trimmed);
  if (!size) return null;

  const px = toPx(size);
  if (px === null) return null;

  return px / fontSizePx;
};

export const extractCssVarName = (
  value: string,
): { varName: string; fallback: string | null } | null => {
  const match = value.match(/var\(\s*(--.+?)(?:\s*,\s*(.+?))?\s*\)/);
  if (!match) return null;

  return {
    varName: match[1].trim(),
    fallback: match[2]?.trim() ?? null,
  };
};

export const isCssColor = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase();

  if (trimmed.startsWith("#")) return /^#([0-9a-f]{3,8})$/.test(trimmed);
  if (trimmed.startsWith("rgb")) return /^rgba?\(/.test(trimmed);
  if (trimmed.startsWith("hsl")) return /^hsla?\(/.test(trimmed);
  if (trimmed.startsWith("oklch")) return trimmed.startsWith("oklch(");
  if (trimmed.startsWith("oklab")) return trimmed.startsWith("oklab(");
  if (trimmed.startsWith("lab")) return trimmed.startsWith("lab(");
  if (trimmed.startsWith("lch")) return trimmed.startsWith("lch(");
  if (trimmed === "transparent" || trimmed === "currentcolor") return true;
  if (trimmed.startsWith("var(")) return false;

  return CSS_NAMED_COLORS.has(trimmed);
};

const CSS_NAMED_COLORS = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure",
  "beige", "bisque", "black", "blanchedalmond", "blue",
  "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
  "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson",
  "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
  "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen",
  "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
  "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
  "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey",
  "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia",
  "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green",
  "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo",
  "ivory", "khaki", "lavender", "lavenderblush", "lawngreen",
  "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
  "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
  "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
  "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
  "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
  "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
  "mediumslateblue", "mediumspringgreen", "mediumturquoise",
  "mediumvioletred", "midnightblue", "mintcream", "mistyrose",
  "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab",
  "orange", "orangered", "orchid", "palegoldenrod", "palegreen",
  "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru",
  "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
  "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown",
  "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue",
  "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan",
  "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
  "whitesmoke", "yellow", "yellowgreen",
]);
