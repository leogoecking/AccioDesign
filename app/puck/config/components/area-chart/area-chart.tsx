import { useId } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
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
  type ChartCurveType,
  type ChartHeight,
  type ChartValueFormat,
} from "~/puck/components/chart-utils";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { ErrorBoundary } from "~/puck/components/error-boundary";

export interface AreaChartDataPoint {
  label: string;
  primary: number;
  secondary?: number;
}

export interface ChartSeriesMeta {
  label: string;
  color: ChartColorToken;
}

export interface AreaChartViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  valueFormat?: ChartValueFormat;
  unit?: string;
  height?: ChartHeight;
  curveType?: ChartCurveType;
  fillStyle?: "gradient" | "solid";
  stacked?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  primarySeries: ChartSeriesMeta;
  showSecondarySeries?: boolean;
  secondarySeries?: ChartSeriesMeta;
  data: AreaChartDataPoint[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
}

export const AreaChart = ({
  title,
  description,
  badgeLabel,
  valueFormat = "number",
  unit,
  height = "md",
  curveType = "monotone",
  fillStyle = "gradient",
  stacked = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  primarySeries = { label: "Receita", color: "chart-1" },
  showSecondarySeries = true,
  secondarySeries = { label: "Despesas", color: "chart-2" },
  data = [],
  emptyMessage,
  padding,
}: AreaChartViewProps) => {
  const reactId = useId();
  const instanceId = buildUniqueChartInstanceId(reactId, "area");
  const heightPx = CHART_HEIGHT_PX[height] ?? CHART_HEIGHT_PX.md;

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
  const yDomain = computeSafeNumericDomain(allValues);

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
                aria-label={title || "Gráfico de área"}
                className="min-w-0 w-full"
              >
                <ChartContainer
                  id={instanceId}
                  config={chartConfig}
                  height={heightPx}
                >
                  <RechartsAreaChart
                    accessibilityLayer
                    data={cleanData}
                    margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={`${instanceId}-grad-primary`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0.32}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                      {hasSecondaryData ? (
                        <linearGradient
                          id={`${instanceId}-grad-secondary`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-secondary)"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-secondary)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      ) : null}
                    </defs>

                    {showGrid ? (
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    ) : null}

                    {showXAxis ? (
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={16}
                      />
                    ) : null}

                    {showYAxis ? (
                      <YAxis
                        domain={yDomain}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={valueFormat === "currency" ? 74 : 56}
                        tickFormatter={(value) =>
                          formatChartAxisTick(Number(value), valueFormat)
                        }
                      />
                    ) : null}

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

                    {hasSecondaryData ? (
                      <Area
                        dataKey="secondary"
                        name={secondarySeries?.label || "Série comparativa"}
                        type={curveType}
                        fill={
                          fillStyle === "gradient"
                            ? `url(#${instanceId}-grad-secondary)`
                            : "var(--color-secondary)"
                        }
                        fillOpacity={fillStyle === "gradient" ? 1 : 0.18}
                        stroke="var(--color-secondary)"
                        strokeWidth={2}
                        stackId={stacked ? "stack" : undefined}
                        isAnimationActive={false}
                        activeDot={{
                          r: 4.5,
                          strokeWidth: 2,
                          stroke: "var(--background)",
                        }}
                      />
                    ) : null}

                    <Area
                      dataKey="primary"
                      name={primarySeries?.label || "Série principal"}
                      type={curveType}
                      fill={
                        fillStyle === "gradient"
                          ? `url(#${instanceId}-grad-primary)`
                          : "var(--color-primary)"
                      }
                      fillOpacity={fillStyle === "gradient" ? 1 : 0.22}
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      stackId={stacked ? "stack" : undefined}
                      isAnimationActive={false}
                      activeDot={{
                        r: 4.5,
                        strokeWidth: 2,
                        stroke: "var(--background)",
                      }}
                    />

                    {showLegend ? (
                      <ChartLegend content={<ChartLegendContent />} />
                    ) : null}
                  </RechartsAreaChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
