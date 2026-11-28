import { useId } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartEmptyState,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  buildUniqueChartInstanceId,
  CHART_HEIGHT_PX,
  computeSafeNumericDomain,
  formatChartAxisTick,
  formatChartValue,
  resolveChartColor,
  toSafeNumber,
  type ChartColorToken,
  type ChartHeight,
  type ChartValueFormat,
} from "~/puck/components/chart-utils";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { ErrorBoundary } from "~/puck/components/error-boundary";

export interface BarChartDataPoint {
  label: string;
  primary: number;
  secondary?: number;
}

export interface BarChartSeriesMeta {
  label: string;
  color: ChartColorToken;
}

export interface BarChartViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  valueFormat?: ChartValueFormat;
  unit?: string;
  height?: ChartHeight;
  orientation?: "vertical" | "horizontal";
  stacked?: boolean;
  barRadius?: "none" | "sm" | "md";
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  primarySeries: BarChartSeriesMeta;
  showSecondarySeries?: boolean;
  secondarySeries?: BarChartSeriesMeta;
  data: BarChartDataPoint[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
}

const BAR_RADIUS_PX = {
  none: 0,
  sm: 4,
  md: 8,
} as const;

export const BarChart = ({
  title,
  description,
  badgeLabel,
  valueFormat = "number",
  unit,
  height = "md",
  orientation = "vertical",
  stacked = false,
  barRadius = "sm",
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  primarySeries = { label: "Resolvidos", color: "chart-1" },
  showSecondarySeries = true,
  secondarySeries = { label: "Pendentes", color: "chart-2" },
  data = [],
  emptyMessage,
  padding,
}: BarChartViewProps) => {
  const reactId = useId();
  const instanceId = buildUniqueChartInstanceId(reactId, "bar");
  const heightPx = CHART_HEIGHT_PX[height] ?? CHART_HEIGHT_PX.md;
  const radiusPx = BAR_RADIUS_PX[barRadius] ?? 4;
  const isHorizontalBars = orientation === "horizontal";

  const cleanData = (Array.isArray(data) ? data : [])
    .map((point) => {
      const primary = toSafeNumber(point?.primary);
      if (primary === null) return null;
      const secondary = showSecondarySeries
        ? toSafeNumber(point?.secondary)
        : null;
      return {
        label: String(point?.label ?? ""),
        primary,
        ...(secondary !== null ? { secondary } : {}),
      };
    })
    .filter(
      (
        item
      ): item is { label: string; primary: number; secondary?: number } =>
        item !== null
    );

  const hasSecondaryData =
    showSecondarySeries &&
    cleanData.some((item) => typeof item.secondary === "number");

  const primaryColor = resolveChartColor(primarySeries?.color, 0);
  const secondaryColor = resolveChartColor(secondarySeries?.color, 1);

  const chartConfig: ChartConfig = {
    primary: {
      label: primarySeries?.label || "Série principal",
      color: primaryColor,
    },
    ...(hasSecondaryData
      ? {
          secondary: {
            label: secondarySeries?.label || "Série comparativa",
            color: secondaryColor,
          },
        }
      : {}),
  };

  const allValues = cleanData.flatMap((item) =>
    typeof item.secondary === "number"
      ? [item.primary, item.secondary]
      : [item.primary]
  );
  const numericDomain = computeSafeNumericDomain(allValues);

  const primaryBarRadius: [number, number, number, number] = isHorizontalBars
    ? stacked && hasSecondaryData
      ? [0, 0, 0, 0]
      : [0, radiusPx, radiusPx, 0]
    : stacked && hasSecondaryData
      ? [0, 0, radiusPx, radiusPx]
      : [radiusPx, radiusPx, 0, 0];

  const secondaryBarRadius: [number, number, number, number] = isHorizontalBars
    ? [0, radiusPx, radiusPx, 0]
    : [radiusPx, radiusPx, 0, 0];

  return (
    <CompoundContainer padding={padding}>
      <ErrorBoundary>
        <Card className="min-w-0">
          <CardHeader>
            <div className="min-w-0 space-y-1">
              <CardTitle className="truncate">{title}</CardTitle>
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>
            {badgeLabel ? (
              <CardAction>
                <Badge variant="secondary">{badgeLabel}</Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="min-w-0">
            {cleanData.length === 0 ? (
              <ChartEmptyState message={emptyMessage} height={heightPx} />
            ) : (
              <div
                role="region"
                aria-label={title || "Gráfico de barras"}
                className="min-w-0 w-full"
              >
                <ChartContainer
                  id={instanceId}
                  config={chartConfig}
                  height={heightPx}
                >
                  <RechartsBarChart
                    accessibilityLayer
                    layout={isHorizontalBars ? "vertical" : "horizontal"}
                    data={cleanData}
                    margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
                  >
                    {showGrid ? (
                      <CartesianGrid
                        vertical={isHorizontalBars}
                        horizontal={!isHorizontalBars}
                        strokeDasharray="3 3"
                      />
                    ) : null}

                    {isHorizontalBars ? (
                      <>
                        {showXAxis ? (
                          <XAxis
                            type="number"
                            domain={numericDomain}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) =>
                              formatChartAxisTick(Number(value), valueFormat)
                            }
                          />
                        ) : (
                          <XAxis type="number" hide domain={numericDomain} />
                        )}
                        {showYAxis ? (
                          <YAxis
                            type="category"
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={88}
                          />
                        ) : (
                          <YAxis type="category" dataKey="label" hide />
                        )}
                      </>
                    ) : (
                      <>
                        {showXAxis ? (
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                        ) : null}
                        {showYAxis ? (
                          <YAxis
                            domain={numericDomain}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={valueFormat === "currency" ? 74 : 56}
                            tickFormatter={(value) =>
                              formatChartAxisTick(Number(value), valueFormat)
                            }
                          />
                        ) : null}
                      </>
                    )}

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

                    <Bar
                      dataKey="primary"
                      name={primarySeries?.label || "Série principal"}
                      fill="var(--color-primary)"
                      radius={primaryBarRadius}
                      stackId={stacked ? "stack" : undefined}
                      isAnimationActive={false}
                    />

                    {hasSecondaryData ? (
                      <Bar
                        dataKey="secondary"
                        name={secondarySeries?.label || "Série comparativa"}
                        fill="var(--color-secondary)"
                        radius={secondaryBarRadius}
                        stackId={stacked ? "stack" : undefined}
                        isAnimationActive={false}
                      />
                    ) : null}

                    {showLegend ? (
                      <ChartLegend content={<ChartLegendContent />} />
                    ) : null}
                  </RechartsBarChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
