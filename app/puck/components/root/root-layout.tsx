import type { ReactNode } from "react";
import { cn } from "cn";
import { TooltipProvider } from "~/components/ui/tooltip";
import {
  getContentMaxWidth,
  LayoutModeProvider,
  normalizeLayoutWidth,
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
  layoutWidth,
}: {
  children: ReactNode;
  surface?: "default" | "muted";
  navigationMode?: NavigationMode;
  density?: VisualDensity;
  mode: "light" | "dark";
  presetId: string;
  layoutWidth?: unknown;
}) {
  const resolvedNavMode = normalizeNavigationMode(navigationMode);
  const resolvedDensity = normalizeVisualDensity(density);

  const width = normalizeLayoutWidth(layoutWidth);
  const maxWidth = getContentMaxWidth(width);

  return (
    <TooltipProvider>
      <LayoutModeProvider navigationMode={resolvedNavMode} density={resolvedDensity}>
        <div
          data-accio-theme="true"
          data-theme-preset={presetId}
          data-theme-mode={mode}
          data-navigation-mode={resolvedNavMode}
          data-density={resolvedDensity}
          data-accio-width={width?.mode ?? "legacy"}
          className={cn(
            "min-h-screen text-foreground antialiased",
            mode === "dark" && "dark",
            surface === "muted" ? "bg-muted/30" : "bg-background"
          )}
        >
          <div className="accio-page-content" style={maxWidth ? { maxInlineSize: maxWidth } : undefined}>
            {children}
          </div>
        </div>
      </LayoutModeProvider>
    </TooltipProvider>
  );
}
