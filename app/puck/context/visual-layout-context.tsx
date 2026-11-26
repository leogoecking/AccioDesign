import { createContext, useContext, type ReactNode } from "react";

export type NavigationMode = "sidebar" | "rail" | "topnav";
export type VisualDensity = "compact" | "default" | "comfortable";

interface LayoutModeContextValue {
  navigationMode: NavigationMode;
  density: VisualDensity;
}

const LayoutModeContext = createContext<LayoutModeContextValue>({
  navigationMode: "sidebar",
  density: "default",
});

export function LayoutModeProvider({
  navigationMode = "sidebar",
  density = "default",
  children,
}: {
  navigationMode?: NavigationMode;
  density?: VisualDensity;
  children: ReactNode;
}) {
  return (
    <LayoutModeContext.Provider value={{ navigationMode, density }}>
      {children}
    </LayoutModeContext.Provider>
  );
}

export function useLayoutMode(): LayoutModeContextValue {
  return useContext(LayoutModeContext);
}

export function normalizeNavigationMode(raw: unknown): NavigationMode {
  if (raw === "rail" || raw === "topnav") {
    return raw;
  }
  return "sidebar";
}

export function normalizeVisualDensity(raw: unknown): VisualDensity {
  if (raw === "compact" || raw === "comfortable") {
    return raw;
  }
  return "default";
}

export const CENTERED_CONTENT_WIDTH = 1440;
export const MIN_CONTENT_WIDTH = 320;
export const MAX_CONTENT_WIDTH = 3840;

export type LayoutWidth =
  | { mode: "fluid" | "centered" }
  | { mode: "custom"; maxWidth: number };

export function normalizeLayoutWidth(value: unknown): LayoutWidth | undefined {
  if (!value || typeof value !== "object" || !("mode" in value)) return;
  if (value.mode === "fluid" || value.mode === "centered") return { mode: value.mode };
  if (value.mode === "custom") {
    const width = "maxWidth" in value ? value.maxWidth : undefined;
    const maxWidth = typeof width === "number" && Number.isFinite(width)
      ? Math.min(MAX_CONTENT_WIDTH, Math.max(MIN_CONTENT_WIDTH, Math.round(width)))
      : CENTERED_CONTENT_WIDTH;
    return { mode: "custom", maxWidth };
  }
}

export function getContentMaxWidth(width: LayoutWidth | undefined): number | undefined {
  if (width?.mode === "custom") return width.maxWidth;
  if (width?.mode === "centered") return CENTERED_CONTENT_WIDTH;
}
