import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { BadgeVariant } from "~/puck/components/badge";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { PuckIcon, type IconName } from "~/puck/components/icon";

export interface StatusBadgeItem {
  label: string;
  value?: string;
  tooltip?: string;
  variant?: BadgeVariant;
  icon?: IconName;
}

export interface StatusBadgeGroupProps {
  title?: string;
  items: StatusBadgeItem[];
  padding?: CompoundContainerProps["padding"];
}

export const StatusBadgeGroup = ({
  title,
  items = [],
  padding,
}: StatusBadgeGroupProps) => {
  return (
    <CompoundContainer padding={padding}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
        {title ? (
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const badgeNode = (
              <Badge variant={item.variant || "secondary"} className="h-6 px-2.5">
                <PuckIcon name={item.icon} className="size-3" />
                <span>{item.label}</span>
                {item.value ? (
                  <span className="font-semibold">{item.value}</span>
                ) : null}
              </Badge>
            );

            if (item.tooltip) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
                  <TooltipContent>{item.tooltip}</TooltipContent>
                </Tooltip>
              );
            }

            return <span key={index}>{badgeNode}</span>;
          })}
        </div>
      </div>
    </CompoundContainer>
  );
};
