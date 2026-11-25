import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "cn";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { BadgeVariant } from "~/puck/components/badge";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";

export interface KpiCardProps {
  title: string;
  value: string;
  delta?: string;
  trend: "up" | "down" | "neutral";
  helperText?: string;
  icon?: IconName;
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
}

export const KpiCard = ({
  title,
  value,
  delta,
  trend = "up",
  helperText,
  icon = "activity",
  badgeLabel,
  badgeVariant = "secondary",
}: KpiCardProps) => {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendClass = cn("inline-flex items-center gap-1 text-xs font-medium", {
    "text-emerald-600 dark:text-emerald-400": trend === "up",
    "text-destructive": trend === "down",
    "text-muted-foreground": trend === "neutral",
  });

  return (
    <ErrorBoundary>
      <Card size="sm" className="h-full justify-between">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
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
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-heading text-3xl font-semibold tracking-tight">
              {value}
            </span>
            {delta ? (
              <span className={trendClass}>
                <TrendIcon className="size-3.5" aria-hidden="true" />
                {delta}
              </span>
            ) : null}
          </div>
          {helperText ? (
            <CardDescription className="text-xs">{helperText}</CardDescription>
          ) : null}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
