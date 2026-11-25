import type { ReactNode } from "react";
import { cn } from "cn";
import { TooltipProvider } from "~/components/ui/tooltip";
import {
  LayoutModeProvider,
  normalizeNavigationMode,
  normalizeVisualDensity,
  type NavigationMode,
  type VisualDensity,
} from "~/puck/context/visual-layout-context";

export function RootLayout({
  children,
  surface = "muted",
  navigationMode,
  density,
  mode,
  presetId,
}: {
  children: ReactNode;
  surface?: "default" | "muted";
  navigationMode?: NavigationMode;
  density?: VisualDensity;
  mode: "light" | "dark";
  presetId: string;
}) {
  const resolvedNavMode = normalizeNavigationMode(navigationMode);
  const resolvedDensity = normalizeVisualDensity(density);

  return (
    <TooltipProvider>
      <LayoutModeProvider navigationMode={resolvedNavMode} density={resolvedDensity}>
        <div
          data-accio-theme="true"
          data-theme-preset={presetId}
          data-theme-mode={mode}
          data-navigation-mode={resolvedNavMode}
          data-density={resolvedDensity}
          className={cn(
            "min-h-screen text-foreground antialiased",
            mode === "dark" && "dark",
            surface === "muted" ? "bg-muted/30" : "bg-background"
          )}
        >
          {children}
        </div>
      </LayoutModeProvider>
    </TooltipProvider>
  );
}
