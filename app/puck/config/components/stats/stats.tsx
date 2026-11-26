import { MoveDownLeft, MoveUpRight } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "~/components/ui/card";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import {
  CompoundContent,
  type CompoundContentProps,
} from "~/puck/components/content";

export interface StatsProps extends CompoundContentProps {
  padding?: CompoundContainerProps["padding"];
  layout?: "section" | "inline";
  statistics: {
    value: string;
    label: string;
    percentage?: number;
    direction?: "none" | "increase" | "decrease";
    polarity?: "none" | "positive" | "negative";
  }[];
}

export const Stats = ({
  padding,
  layout = "inline",
  badge,
  heading,
  description,
  buttons,
  statistics = [],
}: StatsProps) => {
  return (
    <CompoundContainer padding={padding}>
      {layout === "inline" ? (
        <div className="grid grid-cols-1 gap-4 text-start @min-[640px]/section:grid-cols-2 @min-[1280px]/section:grid-cols-4">
          {statistics.map((stat, index) => (
            <Stat
              key={index}
              value={stat.value}
              label={stat.label}
              direction={stat.direction}
              polarity={stat.polarity}
              percentage={stat.percentage}
            />
          ))}
        </div>
      ) : null}
      {layout === "section" ? (
        <div className="grid grid-cols-1 gap-8 @min-[1024px]/section:grid-cols-2">
          <CompoundContent
            badge={badge}
            heading={heading}
            description={description}
            buttons={buttons}
          />
          <div className="flex items-center justify-center">
            <div className="grid w-full grid-cols-1 gap-4 text-start @min-[640px]/section:grid-cols-2">
              {statistics.map((stat, index) => (
                <Stat
                  key={index}
                  value={stat.value}
                  label={stat.label}
                  direction={stat.direction}
                  polarity={stat.polarity}
                  percentage={stat.percentage}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </CompoundContainer>
  );
};

const Stat = ({
  value,
  label,
  direction,
  polarity,
  percentage,
}: StatsProps["statistics"][number]) => {
  const directionClassName = cn("mb-4 size-4", {
    "text-emerald-600 dark:text-emerald-400": polarity === "positive",
    "text-destructive": polarity === "negative",
    "text-muted-foreground": polarity === "none" || !polarity,
  });

  return (
    <Card size="sm">
      <CardContent className="flex flex-col justify-between gap-1">
        {direction === "increase" ? (
          <MoveUpRight className={directionClassName} />
        ) : null}
        {direction === "decrease" ? (
          <MoveDownLeft className={directionClassName} />
        ) : null}
        <div className="flex flex-row flex-wrap items-baseline gap-x-2 gap-y-0.5 text-start">
          <span className="min-w-0 font-heading text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {typeof percentage === "number" && percentage > 0 ? (
            <span className="text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums">
              {direction === "increase" ? "+" : null}
              {direction === "decrease" ? "-" : null}
              {percentage}%
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
};
