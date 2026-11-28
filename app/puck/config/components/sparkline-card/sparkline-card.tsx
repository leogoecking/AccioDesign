import { useId } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  YAxis,
} from "recharts";
import { cn } from "cn";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import type { BadgeVariant } from "~/puck/components/badge";
import {
  buildUniqueChartInstanceId,
  computeSafeNumericDomain,
  formatChartValue,
  resolveChartColor,
  SPARKLINE_HEIGHT_PX,
  toSafeNumber,
  type ChartColorToken,
  type ChartHeight,
  type ChartValueFormat,
} from "~/puck/components/chart-utils";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";

export interface SparklinePoint {
  label: string;
  value: number;
}

export interface SparklineCardViewProps {
  title: string;
  value: string;
  delta?: string;
  trend: "up" | "down" | "neutral";
  helperText?: string;
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
  icon?: IconName;
  chartType?: "area" | "line" | "bar";
  color?: ChartColorToken;
  height?: ChartHeight;
  valueFormat?: ChartValueFormat;
  unit?: string;
  showTooltip?: boolean;
  data: SparklinePoint[];
}

export const SparklineCard = ({
  title,
  value,
  delta,
  trend = "up",
  helperText,
  badgeLabel,
  badgeVariant = "secondary",
  icon = "trending-up",
  chartType = "area",
  color = "chart-1",
  height = "md",
  valueFormat = "number",
  unit,
  showTooltip = true,
  data = [],
}: SparklineCardViewProps) => {
  const reactId = useId();
  const instanceId = buildUniqueChartInstanceId(reactId, "spark");
  const heightPx = SPARKLINE_HEIGHT_PX[height] ?? SPARKLINE_HEIGHT_PX.md;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendClass = cn(
    "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
    {
      "text-emerald-600 dark:text-emerald-400": trend === "up",
      "text-destructive": trend === "down",
      "text-muted-foreground": trend === "neutral",
    }
  );

  const cleanData = (Array.isArray(data) ? data : [])
    .map((point, index) => {
      const numeric = toSafeNumber(point?.value);
      if (numeric === null) return null;
      return {
        label: String(point?.label ?? `P${index + 1}`),
        value: numeric,
      };
    })
    .filter((item): item is { label: string; value: number } => item !== null);

  const seriesColor = resolveChartColor(color, 0);
  const chartConfig: ChartConfig = {
    value: {
      label: title || "Tendência",
      color: seriesColor,
    },
  };

  const numericValues = cleanData.map((item) => item.value);
  const zeroDomain = computeSafeNumericDomain(numericValues);
  const domain: [number, number] | undefined = (() => {
    if (zeroDomain) return zeroDomain;
    if (numericValues.length === 0) return undefined;
    const minVal = Math.min(...numericValues);
    const maxVal = Math.max(...numericValues);
    if (chartType === "bar") {
      return minVal >= 0 ? [0, maxVal * 1.08] : [minVal * 1.08, maxVal * 1.08];
    }
    if (minVal === maxVal) {
      return [0, maxVal > 0 ? maxVal * 1.25 : 1];
    }
    const pad = (maxVal - minVal) * 0.15;
    return [minVal - pad, maxVal + pad];
  })();

  return (
    <ErrorBoundary>
      <Card size="sm" className="h-full min-w-0">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="min-w-0 truncate text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-2">
            {badgeLabel ? (
              <Badge variant={badgeVariant}>{badgeLabel}</Badge>
            ) : null}
            {icon && icon !== "none" ? (
              <div className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <PuckIcon name={icon} className="size-4" />
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
              {value}
            </span>
            {delta ? (
              <span className={trendClass}>
                <TrendIcon className="size-3.5" aria-hidden="true" />
                {delta}
              </span>
            ) : null}
          </div>

          {cleanData.length === 0 ? (
            <div
              role="status"
              style={{ height: heightPx }}
              className="flex items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-3 text-[11px] text-muted-foreground"
            >
              Sem histórico disponível
            </div>
          ) : (
            <div
              role="region"
              aria-label={`Tendência histórica de ${title}`}
              className="min-w-0 w-full"
            >
              <ChartContainer
                id={instanceId}
                config={chartConfig}
                height={heightPx}
                initialWidth={260}
              >
                {chartType === "bar" ? (
                  <BarChart
                    accessibilityLayer
                    data={cleanData}
                    margin={{ top: 4, right: 2, left: 2, bottom: 0 }}
                  >
                    <YAxis hide domain={domain} />
                    {showTooltip ? (
                      <ChartTooltip
                        cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            valueFormatter={(val) =>
                              formatChartValue(val, valueFormat, unit)
                            }
                          />
                        }
                      />
                    ) : null}
                    <Bar
                      dataKey="value"
                      name={title}
                      fill="var(--color-value)"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart
                    accessibilityLayer
                    data={cleanData}
                    margin={{ top: 6, right: 4, left: 4, bottom: 2 }}
                  >
                    <YAxis hide domain={domain} />
                    {showTooltip ? (
                      <ChartTooltip
                        cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                        content={
                          <ChartTooltipContent
                            indicator="line"
                            valueFormatter={(val) =>
                              formatChartValue(val, valueFormat, unit)
                            }
                          />
                        }
                      />
                    ) : null}
                    <Line
                      dataKey="value"
                      name={title}
                      type="monotone"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        strokeWidth: 2,
                        stroke: "var(--background)",
                      }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    accessibilityLayer
                    data={cleanData}
                    margin={{ top: 6, right: 4, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={`${instanceId}-grad`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-value)"
                          stopOpacity={0.32}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-value)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={domain} />
                    {showTooltip ? (
                      <ChartTooltip
                        cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            valueFormatter={(val) =>
                              formatChartValue(val, valueFormat, unit)
                            }
                          />
                        }
                      />
                    ) : null}
                    <Area
                      dataKey="value"
                      name={title}
                      type="monotone"
                      fill={`url(#${instanceId}-grad)`}
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      activeDot={{
                        r: 4,
                        strokeWidth: 2,
                        stroke: "var(--background)",
                      }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                )}
              </ChartContainer>
            </div>
          )}

          {helperText ? (
            <CardDescription className="text-xs">{helperText}</CardDescription>
          ) : null}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
