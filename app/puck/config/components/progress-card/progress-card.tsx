import { cn } from "cn";
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
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { ErrorBoundary } from "~/puck/components/error-boundary";

export type ProgressTone =
  | "primary"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "destructive";

export type ProgressValueFormat = "number" | "currency" | "percent";

export interface ProgressGoalItem {
  label: string;
  helperText?: string;
  current: number;
  target: number;
  format?: ProgressValueFormat;
  unit?: string;
  tone?: ProgressTone;
}

export interface ProgressCardViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  barSize?: "sm" | "md";
  items: ProgressGoalItem[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
}

const VALID_TONES = new Set<ProgressTone>([
  "primary",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "destructive",
]);

function formatGoalValue(
  rawValue: number,
  format: ProgressValueFormat = "number",
  unit?: string
): string {
  const value = Number.isFinite(rawValue) ? rawValue : 0;
  const cleanUnit = unit?.trim();
  let formatted: string;

  switch (format) {
    case "currency":
      formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
      }).format(value);
      break;
    case "percent":
      formatted = `${new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 1,
      }).format(value)}%`;
      break;
    case "number":
    default:
      formatted = new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 1,
      }).format(value);
      break;
  }

  return cleanUnit ? `${formatted} ${cleanUnit}` : formatted;
}

export interface ResolvedProgressMetrics {
  current: number;
  target: number;
  hasTarget: boolean;
  isExceeded: boolean;
  rawPct: number | null;
  fillPct: number;
  ariaValueMin: number;
  ariaValueMax: number;
  ariaValueNow: number;
  ariaValueText: string | undefined;
  formattedCurrent: string;
  formattedTarget: string;
}

export function resolveProgressMetrics(
  item: ProgressGoalItem
): ResolvedProgressMetrics {
  const current =
    typeof item.current === "number" && Number.isFinite(item.current)
      ? Math.max(0, item.current)
      : 0;
  const target =
    typeof item.target === "number" && Number.isFinite(item.target)
      ? Math.max(0, item.target)
      : 0;
  const hasTarget = target > 0;
  const isExceeded = hasTarget && current > target;
  const formattedCurrent = formatGoalValue(current, item.format, item.unit);
  const formattedTarget = formatGoalValue(target, item.format, item.unit);

  if (!hasTarget) {
    return {
      current,
      target,
      hasTarget: false,
      isExceeded: false,
      rawPct: null,
      fillPct: 0,
      ariaValueMin: 0,
      ariaValueMax: 100,
      ariaValueNow: 0,
      ariaValueText: `Meta não definida (valor atual: ${formattedCurrent})`,
      formattedCurrent,
      formattedTarget,
    };
  }

  const rawPct = Math.round((current / target) * 100);
  const fillPct = Math.min(100, Math.max(0, (current / target) * 100));

  return {
    current,
    target,
    hasTarget: true,
    isExceeded,
    rawPct,
    fillPct,
    ariaValueMin: 0,
    ariaValueMax: target,
    ariaValueNow: Math.min(current, target),
    ariaValueText: isExceeded
      ? `${rawPct}% (${formattedCurrent} de ${formattedTarget}, meta ultrapassada)`
      : undefined,
    formattedCurrent,
    formattedTarget,
  };
}

export const ProgressCard = ({
  title,
  description,
  badgeLabel,
  showPercentage = true,
  showValues = true,
  barSize = "md",
  items = [],
  emptyMessage = "Nenhuma meta configurada no momento.",
  padding,
}: ProgressCardViewProps) => {
  const safeItems = Array.isArray(items) ? items : [];

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
            {safeItems.length === 0 ? (
              <div
                role="status"
                className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center"
              >
                <p className="max-w-xs text-xs text-muted-foreground">
                  {emptyMessage}
                </p>
              </div>
            ) : (
              <div
                role="region"
                aria-label={title || "Metas e progresso"}
                className="flex flex-col gap-4"
              >
                {safeItems.map((item, index) => {
                  const metrics = resolveProgressMetrics(item);
                  const tone = item.tone && VALID_TONES.has(item.tone) ? item.tone : "primary";
                  const goalState = !metrics.hasTarget
                    ? "no-target"
                    : metrics.isExceeded
                      ? "exceeded"
                      : "normal";

                  return (
                    <div key={`${item.label}-${index}`} className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="min-w-0 text-sm font-medium text-foreground break-words">
                          {item.label}
                        </span>
                        <div className="flex shrink-0 items-baseline gap-2 text-xs tabular-nums">
                          {showValues ? (
                            <span className="text-muted-foreground">
                              {metrics.hasTarget
                                ? `${metrics.formattedCurrent} de ${metrics.formattedTarget}`
                                : showPercentage
                                  ? metrics.formattedCurrent
                                  : `${metrics.formattedCurrent} · sem meta`}
                            </span>
                          ) : null}
                          {showPercentage ? (
                            metrics.hasTarget ? (
                              <span className="font-semibold text-foreground">
                                {metrics.rawPct}%
                              </span>
                            ) : (
                              <span className="font-medium text-muted-foreground">
                                Sem meta
                              </span>
                            )
                          ) : null}
                        </div>
                      </div>

                      <div
                        role="progressbar"
                        aria-label={item.label}
                        aria-valuenow={metrics.ariaValueNow}
                        aria-valuemin={metrics.ariaValueMin}
                        aria-valuemax={metrics.ariaValueMax}
                        aria-valuetext={metrics.ariaValueText}
                        data-goal-state={goalState}
                        className={cn(
                          "w-full overflow-hidden rounded-full bg-muted",
                          barSize === "sm" ? "h-1.5" : "h-2.5"
                        )}
                      >
                        <div
                          style={{
                            width: `${metrics.fillPct}%`,
                            backgroundColor: `var(--${tone})`,
                          }}
                          className="h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
                        />
                      </div>

                      {item.helperText ? (
                        <p className="text-xs text-muted-foreground break-words">
                          {item.helperText}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
