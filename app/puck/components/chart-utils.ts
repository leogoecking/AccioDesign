import { useEffect, useState } from "react";

export type ChartColorToken =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "primary"
  | "secondary"
  | "accent"
  | "destructive";

export type ChartValueFormat = "number" | "currency" | "percent" | "compact";

export type ChartHeight = "sm" | "md" | "lg";

export type ChartCurveType = "monotone" | "linear" | "step";

export const CHART_HEIGHT_PX: Record<ChartHeight, number> = {
  sm: 200,
  md: 272,
  lg: 344,
};

export const SPARKLINE_HEIGHT_PX: Record<ChartHeight, number> = {
  sm: 56,
  md: 72,
  lg: 96,
};

const VALID_CHART_COLORS = new Set<ChartColorToken>([
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "primary",
  "secondary",
  "accent",
  "destructive",
]);

const DEFAULT_PALETTE: ChartColorToken[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

export function resolveChartColor(
  token?: ChartColorToken,
  fallbackIndex = 0
): string {
  if (token && VALID_CHART_COLORS.has(token)) {
    return `var(--${token})`;
  }
  const fallback = DEFAULT_PALETTE[fallbackIndex % DEFAULT_PALETTE.length];
  return `var(--${fallback})`;
}

export function toSafeNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatChartValue(
  value: number,
  format: ChartValueFormat = "number",
  unit?: string
): string {
  if (!Number.isFinite(value)) return "—";
  const cleanUnit = unit?.trim();

  let formatted: string;
  switch (format) {
    case "currency":
      formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
      }).format(value);
      break;
    case "percent":
      formatted = `${new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
        maximumFractionDigits: 2,
      }).format(value)}%`;
      break;
    case "compact":
      formatted = new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
      break;
    case "number":
    default:
      formatted = new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 2,
      }).format(value);
      break;
  }

  return cleanUnit ? `${formatted} ${cleanUnit}` : formatted;
}

export function formatChartAxisTick(
  value: number,
  format: ChartValueFormat = "number"
): string {
  if (!Number.isFinite(value)) return "";
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: Math.abs(value) >= 1000 ? "compact" : "standard",
        maximumFractionDigits: Math.abs(value) >= 1000 ? 1 : 0,
      }).format(value);
    case "percent":
      return `${new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 1,
      }).format(value)}%`;
    case "compact":
      return new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    case "number":
    default:
      return new Intl.NumberFormat("pt-BR", {
        notation: Math.abs(value) >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
      }).format(value);
  }
}

export function buildUniqueChartInstanceId(
  rawReactId: string,
  prefix = "chart"
): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "") || "chart";
  const safeReactId = rawReactId.replace(/[^a-zA-Z0-9_-]/g, "") || "instance";
  return `${safePrefix}-${safeReactId}`;
}

export function computeSafeNumericDomain(
  values: number[]
): [number, number] | undefined {
  if (values.length === 0) return undefined;
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  if (minVal === 0 && maxVal === 0) {
    return [0, 1];
  }
  return undefined;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
