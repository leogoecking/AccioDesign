import { Fragment } from "react";
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
import { PuckIcon, type IconName } from "~/puck/components/icon";

export type TimelineStatus = "default" | "success" | "warning" | "error";

export interface ActivityTimelineItem {
  id?: string;
  title: string;
  description?: string;
  timestamp: string;
  dateLabel?: string;
  actor?: string;
  category?: string;
  status: TimelineStatus;
  icon?: IconName;
}

export interface ActivityTimelineViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  groupByDate?: boolean;
  compact?: boolean;
  showCategory?: boolean;
  items: ActivityTimelineItem[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
  onSelectItem?: (item: ActivityTimelineItem, index: number) => void;
}

const STATUS_NODE_CLASS: Record<TimelineStatus, string> = {
  default: "border-border bg-muted text-muted-foreground",
  success: "border-primary/35 bg-primary/10 text-primary",
  warning: "border-foreground/25 bg-accent text-accent-foreground",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
};

function groupTimelineItems(
  items: ActivityTimelineItem[],
  groupByDate: boolean
): Array<{ dateLabel: string; entries: Array<{ item: ActivityTimelineItem; index: number }> }> {
  if (!groupByDate) {
    return [{ dateLabel: "", entries: items.map((item, index) => ({ item, index })) }];
  }

  const groups = new Map<string, Array<{ item: ActivityTimelineItem; index: number }>>();
  items.forEach((item, index) => {
    const key = (item.dateLabel || "Recentes").trim();
    const list = groups.get(key);
    if (list) {
      list.push({ item, index });
    } else {
      groups.set(key, [{ item, index }]);
    }
  });

  return Array.from(groups, ([dateLabel, entries]) => ({ dateLabel, entries }));
}

export const ActivityTimeline = ({
  title,
  description,
  badgeLabel,
  groupByDate = true,
  compact = false,
  showCategory = true,
  items = [],
  emptyMessage = "Nenhuma atividade registrada no histórico.",
  padding,
  onSelectItem,
}: ActivityTimelineViewProps) => {
  const safeItems = Array.isArray(items) ? items : [];
  const groups = groupTimelineItems(safeItems, Boolean(groupByDate));

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
                aria-label={title || "Linha do tempo de atividades"}
                className="flex flex-col gap-5"
              >
                {groups.map((group, groupIdx) => (
                  <div key={`${group.dateLabel}-${groupIdx}`} className="space-y-3">
                    {groupByDate && group.dateLabel ? (
                      <div className="text-xs font-medium text-muted-foreground">
                        {group.dateLabel}
                      </div>
                    ) : null}

                    <ol className="relative space-y-0">
                      {group.entries.map(({ item, index }, entryIdx) => {
                        const isLast = entryIdx === group.entries.length - 1;
                        const statusClass =
                          STATUS_NODE_CLASS[item.status] ?? STATUS_NODE_CLASS.default;
                        const iconName: IconName =
                          item.icon && item.icon !== "none"
                            ? item.icon
                            : item.status === "success"
                              ? "check"
                              : item.status === "error"
                                ? "alert-circle"
                                : "activity";

                        const innerContent = (
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                              <span className="min-w-0 text-sm font-medium text-foreground break-words">
                                {item.title}
                              </span>
                              <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {item.timestamp}
                              </time>
                            </div>

                            {item.description ? (
                              <p className="text-xs leading-relaxed text-muted-foreground break-words">
                                {item.description}
                              </p>
                            ) : null}

                            {(item.actor || (showCategory && item.category)) ? (
                              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                                {showCategory && item.category ? (
                                  <Badge variant="outline" className="h-5 px-2 text-[11px]">
                                    {item.category}
                                  </Badge>
                                ) : null}
                                {item.actor ? (
                                  <span className="truncate">{item.actor}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );

                        return (
                          <Fragment key={item.id || `${index}-${item.title}`}>
                            <li
                              className={cn(
                                "relative flex gap-3",
                                isLast ? "pb-0" : compact ? "pb-3.5" : "pb-5"
                              )}
                            >
                              {!isLast ? (
                                <span
                                  aria-hidden="true"
                                  className="absolute top-7 bottom-0 left-[13px] w-px bg-border"
                                />
                              ) : null}

                              <span
                                aria-hidden="true"
                                className={cn(
                                  "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                                  statusClass
                                )}
                              >
                                <PuckIcon name={iconName} className="size-3.5" />
                              </span>

                              {onSelectItem ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectItem(item, index)}
                                  className="-mx-2 flex min-w-0 flex-1 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                                >
                                  {innerContent}
                                </button>
                              ) : (
                                innerContent
                              )}
                            </li>
                          </Fragment>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
