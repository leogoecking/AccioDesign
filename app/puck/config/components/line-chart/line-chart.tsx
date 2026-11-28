import { useId } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
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

export interface LineChartDataPoint {
  label: string;
  primary: number;
  secondary?: number;
}

export interface LineChartSeriesMeta {
  label: string;
  color: ChartColorToken;
}

export interface LineChartViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  valueFormat?: ChartValueFormat;
  unit?: string;
  height?: ChartHeight;
  curveType?: ChartCurveType;
  showDots?: boolean;
  dashedSecondary?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  primarySeries: LineChartSeriesMeta;
  showSecondarySeries?: boolean;
  secondarySeries?: LineChartSeriesMeta;
  data: LineChartDataPoint[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
}

export const LineChart = ({
  title,
  description,
  badgeLabel,
  valueFormat = "number",
  unit,
  height = "md",
  curveType = "monotone",
  showDots = true,
  dashedSecondary = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  primarySeries = { label: "Atual", color: "chart-1" },
  showSecondarySeries = true,
  secondarySeries = { label: "Meta", color: "chart-2" },
  data = [],
  emptyMessage,
  padding,
}: LineChartViewProps) => {
  const reactId = useId();
  const instanceId = buildUniqueChartInstanceId(reactId, "line");
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
            label: secondarySeries?.label || "Referência",
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
                aria-label={title || "Gráfico de linhas"}
                className="min-w-0 w-full"
              >
                <ChartContainer
                  id={instanceId}
                  config={chartConfig}
                  height={heightPx}
                >
                  <RechartsLineChart
                    accessibilityLayer
                    data={cleanData}
                    margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
                  >
                    {showGrid ? (
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    ) : null}

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
                          indicator={dashedSecondary ? "line" : "dot"}
                          valueFormatter={(val) =>
                            formatChartValue(val, valueFormat, unit)
                          }
                        />
                      }
                    />

                    <Line
                      dataKey="primary"
                      name={primarySeries?.label || "Série principal"}
                      type={curveType}
                      stroke="var(--color-primary)"
                      strokeWidth={2.25}
                      dot={
                        showDots
                          ? {
                              r: 3.5,
                              strokeWidth: 1.5,
                              fill: "var(--background)",
                              stroke: "var(--color-primary)",
                            }
                          : false
                      }
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "var(--background)",
                      }}
                      isAnimationActive={false}
                    />

                    {hasSecondaryData ? (
                      <Line
                        dataKey="secondary"
                        name={secondarySeries?.label || "Referência"}
                        type={curveType}
                        stroke="var(--color-secondary)"
                        strokeWidth={2}
                        strokeDasharray={dashedSecondary ? "5 4" : undefined}
                        dot={
                          showDots && !dashedSecondary
                            ? {
                                r: 3,
                                strokeWidth: 1.5,
                                fill: "var(--background)",
                                stroke: "var(--color-secondary)",
                              }
                            : false
                        }
                        activeDot={{
                          r: 4.5,
                          strokeWidth: 2,
                          stroke: "var(--background)",
                        }}
                        isAnimationActive={false}
                      />
                    ) : null}

                    {showLegend ? (
                      <ChartLegend content={<ChartLegendContent />} />
                    ) : null}
                  </RechartsLineChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
