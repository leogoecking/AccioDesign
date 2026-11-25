/**
 * Adapted from Tweakcn (https://github.com/jnsahaj/tweakcn)
 * Original source: utils/color-converter.ts
 * Licensed under the Apache License, Version 2.0 (see ./LICENSE-TWEAKCN-APACHE-2.0.txt).
 *
 * Modifications for AccioDesign:
 * - Implemented pure TypeScript parsing and CSS Color 4 conversions (hex, rgb, hsl, oklch)
 *   without requiring the external `culori` dependency.
 * - Added `colorToHex` for syncing `<input type="color">` controls reliably.
 */

import type { ColorFormat } from "./types";

interface RgbaColor {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
  a: number; // 0..1
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  const clamped = clamp01(channel);
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function hslToRgb(hDeg: number, s: number, l: number, a = 1): RgbaColor {
  const h = (((hDeg % 360) + 360) % 360) / 360;
  const sat = clamp01(s);
  const lig = clamp01(l);

  if (sat === 0) {
    return { r: lig, g: lig, b: lig, a };
  }

  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;
  const hue2rgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return {
    r: hue2rgb(h + 1 / 3),
    g: hue2rgb(h),
    b: hue2rgb(h - 1 / 3),
    a,
  };
}

function rgbToHsl(rgb: RgbaColor): { h: number; s: number; l: number; a: number } {
  const r = clamp01(rgb.r);
  const g = clamp01(rgb.g);
  const b = clamp01(rgb.b);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l, a: rgb.a };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }

  return { h: h * 60, s, l, a: rgb.a };
}

function oklchToRgb(l: number, c: number, hDeg: number, a = 1): RgbaColor {
  const hRad = ((Number.isFinite(hDeg) ? hDeg : 0) * Math.PI) / 180;
  const aLab = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = l - 0.0894841775 * aLab - 1.291485548 * bLab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: linearToSrgb(rLin),
    g: linearToSrgb(gLin),
    b: linearToSrgb(bLin),
    a,
  };
}

function rgbToOklch(rgb: RgbaColor): { l: number; c: number; h: number; a: number } {
  const r = srgbToLinear(clamp01(rgb.r));
  const g = srgbToLinear(clamp01(rgb.g));
  const b = srgbToLinear(clamp01(rgb.b));

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const l = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const aLab = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(aLab * aLab + bLab * bLab);
  let h = (Math.atan2(bLab, aLab) * 180) / Math.PI;
  if (h < 0) h += 360;

  return { l, c, h: c < 1e-6 ? 0 : h, a: rgb.a };
}

function parseAlpha(raw?: string): number {
  if (!raw) return 1;
  const trimmed = raw.trim();
  if (trimmed.endsWith("%")) {
    return clamp01(parseFloat(trimmed) / 100);
  }
  return clamp01(parseFloat(trimmed));
}

export function parseColor(colorValue: string): RgbaColor | null {
  if (!colorValue || typeof colorValue !== "string") return null;
  const value = colorValue.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16) / 255;
      const g = parseInt(hex[1] + hex[1], 16) / 255;
      const b = parseInt(hex[2] + hex[2], 16) / 255;
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      if ([r, g, b, a].some(Number.isNaN)) return null;
      return { r, g, b, a };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      if ([r, g, b, a].some(Number.isNaN)) return null;
      return { r, g, b, a };
    }
    return null;
  }

  const rgbMatch = value.match(/^rgba?\((.+)\)$/i);
  if (rgbMatch) {
    const [mainPart, alphaPart] = rgbMatch[1].split("/").map((p) => p.trim());
    const parts = mainPart.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const toChan = (token: string) =>
      token.endsWith("%")
        ? clamp01(parseFloat(token) / 100)
        : clamp01(parseFloat(token) / 255);
    const r = toChan(parts[0]);
    const g = toChan(parts[1]);
    const b = toChan(parts[2]);
    const a = alphaPart
      ? parseAlpha(alphaPart)
      : parts[3]
        ? parseAlpha(parts[3])
        : 1;
    if ([r, g, b, a].some(Number.isNaN)) return null;
    return { r, g, b, a };
  }

  const hslMatch = value.match(/^hsla?\((.+)\)$/i);
  if (hslMatch) {
    const [mainPart, alphaPart] = hslMatch[1].split("/").map((p) => p.trim());
    const parts = mainPart.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const a = alphaPart
      ? parseAlpha(alphaPart)
      : parts[3]
        ? parseAlpha(parts[3])
        : 1;
    if ([h, s, l, a].some(Number.isNaN)) return null;
    return hslToRgb(h, s, l, a);
  }

  const oklchMatch = value.match(/^oklch\((.+)\)$/i);
  if (oklchMatch) {
    const [mainPart, alphaPart] = oklchMatch[1].split("/").map((p) => p.trim());
    const parts = mainPart.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const lRaw = parts[0];
    const l = lRaw.endsWith("%") ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
    const c = parseFloat(parts[1]);
    const h = parts[2].toLowerCase() === "none" ? 0 : parseFloat(parts[2]);
    const a = alphaPart ? parseAlpha(alphaPart) : 1;
    if ([l, c, h, a].some(Number.isNaN)) return null;
    return oklchToRgb(l, c, h, a);
  }

  return null;
}

export const formatNumber = (num?: number): string => {
  if (!num || Math.abs(num) < 1e-6) return "0";
  return num % 1 === 0 ? String(num) : num.toFixed(4).replace(/\.?0+$/, "");
};

export function colorToHex(colorValue: string): string {
  const rgb = parseColor(colorValue);
  if (!rgb) return "#000000";

  const toHexByte = (channel: number) =>
    Math.round(clamp01(channel) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHexByte(rgb.r)}${toHexByte(rgb.g)}${toHexByte(rgb.b)}`;
}

export const colorFormatter = (
  colorValue: string,
  format: ColorFormat = "hsl",
  tailwindVersion: "3" | "4" = "4"
): string => {
  const rgb = parseColor(colorValue);
  if (!rgb) return colorValue;

  switch (format) {
    case "hex":
      return colorToHex(colorValue);
    case "rgb": {
      const r = Math.round(rgb.r * 255);
      const g = Math.round(rgb.g * 255);
      const b = Math.round(rgb.b * 255);
      return rgb.a < 1
        ? `rgb(${r} ${g} ${b} / ${formatNumber(rgb.a)})`
        : `rgb(${r}, ${g}, ${b})`;
    }
    case "hsl": {
      const hsl = rgbToHsl(rgb);
      const h = formatNumber(hsl.h);
      const s = formatNumber(hsl.s * 100);
      const l = formatNumber(hsl.l * 100);
      if (tailwindVersion === "4") {
        return rgb.a < 1
          ? `hsl(${h} ${s}% ${l}% / ${formatNumber(rgb.a)})`
          : `hsl(${h} ${s}% ${l}%)`;
      }
      return rgb.a < 1
        ? `${h} ${s}% ${l}% / ${formatNumber(rgb.a)}`
        : `${h} ${s}% ${l}%`;
    }
    case "oklch": {
      const oklch = rgbToOklch(rgb);
      const base = `${formatNumber(oklch.l)} ${formatNumber(oklch.c)} ${formatNumber(oklch.h)}`;
      return rgb.a < 1
        ? `oklch(${base} / ${formatNumber(rgb.a)})`
        : `oklch(${base})`;
    }
    default:
      return colorValue;
  }
};
