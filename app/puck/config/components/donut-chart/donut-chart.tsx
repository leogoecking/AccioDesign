import { useId } from "react";
import { Pie, PieChart as RechartsPieChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  buildUniqueChartInstanceId,
  CHART_HEIGHT_PX,
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

export interface DonutChartSegment {
  label: string;
  value: number;
  color: ChartColorToken;
}

export interface DonutChartViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  valueFormat?: ChartValueFormat;
  unit?: string;
  height?: ChartHeight;
  variant?: "donut" | "pie";
  showCenterTotal?: boolean;
  centerLabel?: string;
  showLegend?: boolean;
  data: DonutChartSegment[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
}

export const DonutChart = ({
  title,
  description,
  badgeLabel,
  valueFormat = "number",
  unit,
  height = "md",
  variant = "donut",
  showCenterTotal = true,
  centerLabel = "Total",
  showLegend = true,
  data = [],
  emptyMessage,
  padding,
}: DonutChartViewProps) => {
  const reactId = useId();
  const instanceId = buildUniqueChartInstanceId(reactId, "donut");
  const heightPx = CHART_HEIGHT_PX[height] ?? CHART_HEIGHT_PX.md;

  const cleanSegments = (Array.isArray(data) ? data : [])
    .map((item, idx) => {
      const safeVal = toSafeNumber(item?.value);
      if (safeVal === null || safeVal < 0) return null;
      return {
        key: `slice${idx}`,
        name: String(item?.label ?? `Categoria ${idx + 1}`),
        value: safeVal,
        fill: resolveChartColor(item?.color, idx),
      };
    })
    .filter(
      (
        item
      ): item is {
        key: string;
        name: string;
        value: number;
        fill: string;
      } => item !== null
    );

  const total = cleanSegments.reduce((sum, item) => sum + item.value, 0);
  const nonZeroSegments = cleanSegments.filter((item) => item.value > 0);
  const isDonut = variant === "donut";

  const chartConfig: ChartConfig = Object.fromEntries(
    cleanSegments.map((item) => [
      item.key,
      {
        label: item.name,
        color: item.fill,
      },
    ])
  );

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
            {cleanSegments.length === 0 || total <= 0 ? (
              <ChartEmptyState
                message={
                  cleanSegments.length > 0 && total <= 0
                    ? "Distribuição zerada: informe valores positivos para visualizar as proporções."
                    : emptyMessage
                }
                height={heightPx}
              />
            ) : (
              <div
                role="region"
                aria-label={title || "Gráfico de distribuição"}
                className={
                  showLegend
                    ? "grid min-w-0 grid-cols-1 items-center gap-4 @min-[540px]/section:grid-cols-[minmax(0,1fr)_minmax(190px,240px)]"
                    : "min-w-0 w-full"
                }
              >
                <div className="relative min-w-0" style={{ height: heightPx }}>
                  <ChartContainer
                    id={instanceId}
                    config={chartConfig}
                    height={heightPx}
                    initialWidth={260}
                  >
                    <RechartsPieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            hideLabel
                            nameKey="key"
                            valueFormatter={(val) =>
                              formatChartValue(val, valueFormat, unit)
                            }
                          />
                        }
                      />
                      <Pie
                        data={nonZeroSegments}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={isDonut ? "60%" : 0}
                        outerRadius="86%"
                        paddingAngle={isDonut && nonZeroSegments.length > 1 ? 2 : 0}
                        cornerRadius={isDonut ? 3 : 2}
                        stroke="var(--background)"
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </RechartsPieChart>
                  </ChartContainer>

                  {isDonut && showCenterTotal ? (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                      <span className="font-heading text-lg font-semibold tracking-tight text-foreground tabular-nums">
                        {formatChartValue(total, valueFormat, unit)}
                      </span>
                      {centerLabel ? (
                        <span className="max-w-[110px] truncate text-[11px] text-muted-foreground">
                          {centerLabel}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {showLegend ? (
                  <ul
                    aria-label="Legenda de distribuição"
                    className="flex min-w-0 flex-col gap-2.5 text-xs"
                  >
                    {cleanSegments.map((item) => {
                      const pct = total > 0 ? (item.value / total) * 100 : 0;
                      return (
                        <li
                          key={item.key}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="size-2.5 shrink-0 rounded-[3px]"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="truncate text-foreground">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
                            <span className="font-medium text-foreground">
                              {formatChartValue(item.value, valueFormat, unit)}
                            </span>
                            <span className="w-10 text-right text-muted-foreground">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
