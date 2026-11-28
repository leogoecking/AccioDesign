/**
 * Adapted from shadcn/ui chart primitives (https://ui.shadcn.com/docs/components/chart)
 * Licensed under the MIT License (see app/export/licenses/LICENSE-SHADCN-MIT.txt).
 *
 * Modifications for AccioDesign:
 * - Compatible with Recharts 3.x and React 19 (sanitized useId and explicit initialDimension).
 * - Imports `cn` from `"cn"` directly so exported standalone frontends bundle cleanly.
 * - Sanitizes injected CSS custom properties in ChartStyle.
 */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "cn";

const THEMES = { light: "", dark: ".dark" } as const;
const SAFE_KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SAFE_COLOR_PATTERN =
  /^(?:var\(--[a-zA-Z0-9-]+\)|#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|oklab)\([^;{}"'<>\\]+\))$/;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart deve ser usado dentro de um <ChartContainer />");
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  height = 272,
  initialWidth = 480,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
  height?: number;
  initialWidth?: number;
}) {
  const uniqueId = React.useId();
  const sanitizedId = (id || uniqueId).replace(/[^a-zA-Z0-9_-]/g, "");
  const chartId = `chart-${sanitizedId || "accio"}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        style={{ height, ...style }}
        className={cn(
          "relative w-full min-w-0 text-xs select-none [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-none [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: initialWidth, height }}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartStyle({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const colorConfig = Object.entries(config).filter(
    ([key, itemConfig]) =>
      SAFE_KEY_PATTERN.test(key) && (itemConfig.theme || itemConfig.color)
  );

  if (!colorConfig.length || !safeId) {
    return null;
  }

  const cssRules = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const declarations = colorConfig
        .map(([key, itemConfig]) => {
          const rawColor =
            itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
            itemConfig.color;
          if (!rawColor) return null;
          const color = rawColor.trim();
          if (!SAFE_COLOR_PATTERN.test(color)) return null;
          return `  --color-${key}: ${color};`;
        })
        .filter(Boolean)
        .join("\n");

      if (!declarations) return "";
      const selector = prefix
        ? `${prefix} [data-chart="${safeId}"]`
        : `[data-chart="${safeId}"]`;
      return `${selector} {\n${declarations}\n}`;
    })
    .filter(Boolean)
    .join("\n");

  if (!cssRules) {
    return null;
  }

  return <style dangerouslySetInnerHTML={{ __html: cssRules }} />;
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export interface ChartTooltipPayloadItem {
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
  dataKey?: string | number | ((obj: unknown) => unknown);
  color?: string;
  fill?: string;
  payload?: Record<string, unknown>;
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  item: ChartTooltipPayloadItem,
  key: string
) {
  const payload =
    item.payload && typeof item.payload === "object" ? item.payload : undefined;

  let configLabelKey = key;
  if (key in item && typeof item[key as keyof ChartTooltipPayloadItem] === "string") {
    configLabelKey = item[key as keyof ChartTooltipPayloadItem] as string;
  } else if (payload && key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  valueFormatter,
  nameKey,
  labelKey,
}: {
  active?: boolean;
  payload?: ReadonlyArray<ChartTooltipPayloadItem>;
  className?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: string | number | React.ReactNode;
  labelFormatter?: (
    value: React.ReactNode,
    payload: ReadonlyArray<ChartTooltipPayloadItem>
  ) => React.ReactNode;
  valueFormatter?: (value: number) => string;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || (typeof item?.dataKey === "string" ? item.dataKey : "") || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const computedValue =
      !labelKey && typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label || label;

    if (labelFormatter) {
      return (
        <div className="font-medium text-popover-foreground">
          {labelFormatter(computedValue, payload)}
        </div>
      );
    }

    if (!computedValue) {
      return null;
    }

    return (
      <div className="font-medium text-popover-foreground">{computedValue}</div>
    );
  }, [label, labelFormatter, payload, hideLabel, config, labelKey]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-[9rem] items-start gap-1.5 rounded-lg border border-border/70 bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-md backdrop-blur-xs",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const dataKeyStr =
            typeof item.dataKey === "string" || typeof item.dataKey === "number"
              ? String(item.dataKey)
              : undefined;
          const key = `${nameKey || item.name || dataKeyStr || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const payloadFill =
            item.payload && typeof item.payload.fill === "string"
              ? item.payload.fill
              : undefined;
          const indicatorColor =
            payloadFill || item.color || item.fill || "var(--primary)";

          const numericValue =
            typeof item.value === "number"
              ? item.value
              : typeof item.value === "string" && item.value.trim() !== ""
                ? Number(item.value)
                : NaN;

          const formattedValue =
            Number.isFinite(numericValue) && valueFormatter
              ? valueFormatter(numericValue)
              : Number.isFinite(numericValue)
                ? numericValue.toLocaleString("pt-BR")
                : item.value !== undefined && item.value !== null
                  ? String(item.value)
                  : "—";

          return (
            <div
              key={`${key}-${index}`}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-3 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {!hideIndicator ? (
                <div
                  className={cn("shrink-0 rounded-[2px]", {
                    "size-2.5": indicator === "dot",
                    "w-1": indicator === "line",
                    "w-0 border-[1.5px] border-dashed bg-transparent":
                      indicator === "dashed",
                    "my-0.5": nestLabel && indicator === "dashed",
                  })}
                  style={{
                    backgroundColor:
                      indicator === "dashed" ? undefined : indicatorColor,
                    borderColor: indicatorColor,
                  }}
                />
              ) : null}
              <div
                className={cn(
                  "flex flex-1 justify-between gap-4 leading-none",
                  nestLabel ? "items-end" : "items-center"
                )}
              >
                <div className="grid gap-1">
                  {nestLabel ? tooltipLabel : null}
                  <span className="text-muted-foreground">
                    {itemConfig?.label || item.name || key}
                  </span>
                </div>
                <span className="font-mono font-medium text-popover-foreground tabular-nums">
                  {formattedValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChartLegend = RechartsPrimitive.Legend;

export interface ChartLegendPayloadItem {
  value?: string;
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: Record<string, unknown>;
}

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: {
  className?: string;
  hideIcon?: boolean;
  payload?: ReadonlyArray<ChartLegendPayloadItem>;
  verticalAlign?: "top" | "bottom" | "middle";
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground",
        verticalAlign === "top" ? "pb-2" : "pt-2.5",
        className
      )}
    >
      {payload.map((item, index) => {
        const dataKeyStr =
          typeof item.dataKey === "string" || typeof item.dataKey === "number"
            ? String(item.dataKey)
            : undefined;
        const key = `${nameKey || dataKeyStr || item.value || "value"}`;
        const itemConfig =
          key in config
            ? config[key]
            : item.value && item.value in config
              ? config[item.value]
              : undefined;

        const swatchColor =
          item.color ||
          (item.payload && typeof item.payload.fill === "string"
            ? item.payload.fill
            : undefined) ||
          "var(--chart-1)";

        return (
          <div key={`${key}-${index}`} className="flex items-center gap-1.5">
            {!hideIcon ? (
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: swatchColor }}
              />
            ) : null}
            <span className="text-foreground/85">
              {itemConfig?.label || item.value || key}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ChartEmptyState({
  message = "Nenhum dado disponível para exibição.",
  height = 220,
}: {
  message?: string;
  height?: number;
}) {
  return (
    <div
      role="status"
      style={{ minHeight: height }}
      className="flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/25 px-4 py-6 text-center"
    >
      <p className="max-w-xs text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
