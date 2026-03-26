import { parse, wcagContrast, formatHex, converter } from "culori";
import {
  WCAG_AA_NORMAL_TEXT_RATIO,
  WCAG_AA_LARGE_TEXT_RATIO,
  WCAG_AA_UI_COMPONENT_RATIO,
  WCAG_AAA_NORMAL_TEXT_RATIO,
  WCAG_AAA_LARGE_TEXT_RATIO,
} from "../constants.js";

const toRgb = converter("rgb");

export const parseColor = (
  colorString: string,
): { r: number; g: number; b: number } | null => {
  const parsed = parse(colorString);
  if (!parsed) return null;

  const rgb = toRgb(parsed);
  if (!rgb) return null;

  return {
    r: Math.round((rgb.r ?? 0) * 255),
    g: Math.round((rgb.g ?? 0) * 255),
    b: Math.round((rgb.b ?? 0) * 255),
  };
};

export const contrastRatio = (color1: string, color2: string): number | null => {
  const parsed1 = parse(color1);
  const parsed2 = parse(color2);
  if (!parsed1 || !parsed2) return null;

  return wcagContrast(parsed1, parsed2);
};

export const meetsWcagAA = (
  ratio: number,
  isLargeText: boolean,
): boolean => {
  const threshold = isLargeText
    ? WCAG_AA_LARGE_TEXT_RATIO
    : WCAG_AA_NORMAL_TEXT_RATIO;
  return ratio >= threshold;
};

export const meetsWcagAAA = (
  ratio: number,
  isLargeText: boolean,
): boolean => {
  const threshold = isLargeText
    ? WCAG_AAA_LARGE_TEXT_RATIO
    : WCAG_AAA_NORMAL_TEXT_RATIO;
  return ratio >= threshold;
};

export const meetsUiComponentContrast = (ratio: number): boolean => {
  return ratio >= WCAG_AA_UI_COMPONENT_RATIO;
};

export const suggestAccessibleColor = (
  foreground: string,
  background: string,
  targetRatio: number = WCAG_AA_NORMAL_TEXT_RATIO,
): string | null => {
  const fgParsed = parse(foreground);
  const bgParsed = parse(background);
  if (!fgParsed || !bgParsed) return null;

  const fgRgb = toRgb(fgParsed);
  if (!fgRgb) return null;

  const currentRatio = wcagContrast(fgParsed, bgParsed);
  if (currentRatio >= targetRatio) return foreground;

  // darken or lighten the foreground to meet the target ratio
  const bgRgb = toRgb(bgParsed);
  if (!bgRgb) return null;

  const bgLuminance = relativeLuminance(
    (bgRgb.r ?? 0) * 255,
    (bgRgb.g ?? 0) * 255,
    (bgRgb.b ?? 0) * 255,
  );

  // determine direction: darken if bg is light, lighten if bg is dark
  const shouldDarken = bgLuminance > 0.5;

  let bestColor = foreground;
  let bestRatio = currentRatio;

  for (let step = 1; step <= 20; step++) {
    const factor = shouldDarken ? 1 - step * 0.05 : 1 + step * 0.05;
    const adjusted = {
      mode: "rgb" as const,
      r: Math.min(1, Math.max(0, (fgRgb.r ?? 0) * factor)),
      g: Math.min(1, Math.max(0, (fgRgb.g ?? 0) * factor)),
      b: Math.min(1, Math.max(0, (fgRgb.b ?? 0) * factor)),
    };

    const ratio = wcagContrast(adjusted, bgParsed);
    if (ratio >= targetRatio && (bestRatio < targetRatio || ratio < bestRatio)) {
      bestColor = formatHex(adjusted);
      bestRatio = ratio;
      break;
    }

    if (ratio > bestRatio) {
      bestColor = formatHex(adjusted);
      bestRatio = ratio;
    }
  }

  return bestColor;
};

export const formatContrastRatio = (ratio: number): string => {
  return `${ratio.toFixed(1)}:1`;
};

export const isValidColor = (colorString: string): boolean => {
  return parse(colorString) !== undefined;
};

// --- APCA (Accessible Perceptual Contrast Algorithm) ---

const APCA_NT = 0.022;
const APCA_SCALE = 1.14;
const APCA_TXT_EXP = 0.57;
const APCA_BG_EXP = 0.56;
const APCA_LOW_CLIP = 0.1;
const APCA_LOW_OFFSET = 0.027;

export const apcaContrast = (textColor: string, bgColor: string): number | null => {
  const textParsed = parse(textColor);
  const bgParsed = parse(bgColor);
  if (!textParsed || !bgParsed) return null;

  const textRgb = toRgb(textParsed);
  const bgRgb = toRgb(bgParsed);
  if (!textRgb || !bgRgb) return null;

  const txtY = sRgbToY(textRgb.r ?? 0, textRgb.g ?? 0, textRgb.b ?? 0);
  const bgY = sRgbToY(bgRgb.r ?? 0, bgRgb.g ?? 0, bgRgb.b ?? 0);

  const txtYc = txtY > APCA_NT ? txtY : txtY + Math.pow(APCA_NT - txtY, 1.414);
  const bgYc = bgY > APCA_NT ? bgY : bgY + Math.pow(APCA_NT - bgY, 1.414);

  let sapc: number;
  if (bgYc > txtYc) {
    sapc = (Math.pow(bgYc, APCA_BG_EXP) - Math.pow(txtYc, APCA_TXT_EXP)) * APCA_SCALE * 100;
  } else {
    sapc = (Math.pow(bgYc, APCA_TXT_EXP) - Math.pow(txtYc, APCA_BG_EXP)) * APCA_SCALE * 100;
  }

  if (Math.abs(sapc) < APCA_LOW_CLIP * 100) return 0;

  return sapc > 0
    ? sapc - APCA_LOW_OFFSET * 100
    : sapc + APCA_LOW_OFFSET * 100;
};

const sRgbToY = (r: number, g: number, b: number): number => {
  const linearize = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126729 * linearize(r) + 0.7151522 * linearize(g) + 0.0721750 * linearize(b);
};

export const meetsApcaThreshold = (
  lc: number,
  fontSizePx: number = 16,
  isBold: boolean = false,
): boolean => {
  const absLc = Math.abs(lc);
  if (fontSizePx >= 24 || (isBold && fontSizePx >= 18)) return absLc >= 60;
  if (fontSizePx >= 18 || (isBold && fontSizePx >= 14)) return absLc >= 65;
  return absLc >= 75;
};

export const formatApcaContrast = (lc: number): string => {
  return `Lc ${lc.toFixed(1)}`;
};

// --- WCAG 2.x helpers ---

const relativeLuminance = (r: number, g: number, b: number): number => {
  const linearize = (channel: number): number => {
    const srgb = channel / 255;
    return srgb <= 0.04045
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  return (
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  );
};
