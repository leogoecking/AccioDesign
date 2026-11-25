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
