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

export type AgendaEventStatus = "upcoming" | "next" | "done" | "cancelled";

export interface AgendaEventItem {
  id?: string;
  dateLabel: string;
  startTime: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  status?: AgendaEventStatus;
  icon?: IconName;
}

export interface AgendaCardViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  highlightNext?: boolean;
  showCategory?: boolean;
  items: AgendaEventItem[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
  onSelectEvent?: (item: AgendaEventItem, index: number) => void;
}

const STATUS_BADGE: Record<
  AgendaEventStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  next: { label: "Próximo", variant: "default" },
  upcoming: { label: "Agendado", variant: "secondary" },
  done: { label: "Concluído", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

function groupByDateLabel(items: AgendaEventItem[]) {
  const groups = new Map<string, Array<{ item: AgendaEventItem; index: number }>>();
  items.forEach((item, index) => {
    const key = (item.dateLabel || "Sem data").trim();
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push({ item, index });
    } else {
      groups.set(key, [{ item, index }]);
    }
  });
  return Array.from(groups, ([dateLabel, entries]) => ({ dateLabel, entries }));
}

export const AgendaCard = ({
  title,
  description,
  badgeLabel,
  highlightNext = true,
  showCategory = true,
  items = [],
  emptyMessage = "Nenhum compromisso agendado para o período.",
  padding,
  onSelectEvent,
}: AgendaCardViewProps) => {
  const safeItems = Array.isArray(items) ? items : [];
  const groups = groupByDateLabel(safeItems);

  const explicitNextIndex = safeItems.findIndex((item) => item.status === "next");
  const fallbackNextIndex = safeItems.findIndex(
    (item) => !item.status || item.status === "upcoming"
  );
  const highlightedIndex = highlightNext
    ? explicitNextIndex >= 0
      ? explicitNextIndex
      : fallbackNextIndex
    : -1;

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
                aria-label={title || "Agenda de eventos"}
                className="flex flex-col gap-5"
              >
                {groups.map((group, groupIndex) => (
                  <section
                    key={`${group.dateLabel}-${groupIndex}`}
                    aria-label={group.dateLabel}
                    className="space-y-2.5"
                  >
                    <h3 className="text-xs font-medium text-muted-foreground">
                      {group.dateLabel}
                    </h3>

                    <ul className="space-y-2">
                      {group.entries.map(({ item, index }) => {
                        const isNext = index === highlightedIndex;
                        const effectiveStatus: AgendaEventStatus = isNext
                          ? "next"
                          : item.status || "upcoming";
                        const statusMeta =
                          STATUS_BADGE[effectiveStatus] ?? STATUS_BADGE.upcoming;
                        const isCancelled = effectiveStatus === "cancelled";
                        const isDone = effectiveStatus === "done";

                        const body = (
                          <div className="flex min-w-0 flex-1 flex-col gap-2 @min-[480px]/section:flex-row @min-[480px]/section:items-start">
                            <div className="flex shrink-0 items-center gap-2 @min-[480px]/section:w-28 @min-[480px]/section:flex-col @min-[480px]/section:items-start @min-[480px]/section:gap-0.5">
                              <span className="text-xs font-semibold text-foreground tabular-nums">
                                {item.startTime}
                              </span>
                              {item.endTime ? (
                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                  até {item.endTime}
                                </span>
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    "min-w-0 text-sm font-medium text-foreground break-words",
                                    isCancelled && "line-through opacity-75",
                                    isDone && "text-muted-foreground"
                                  )}
                                >
                                  {item.title}
                                </span>
                                <Badge variant={statusMeta.variant}>
                                  {statusMeta.label}
                                </Badge>
                              </div>

                              {item.description ? (
                                <p className="text-xs text-muted-foreground break-words">
                                  {item.description}
                                </p>
                              ) : null}

                              {item.location || (showCategory && item.category) ? (
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                                  {showCategory && item.category ? (
                                    <Badge variant="outline" className="h-5 px-2 text-[11px]">
                                      {item.category}
                                    </Badge>
                                  ) : null}
                                  {item.location ? (
                                    <span className="inline-flex items-center gap-1 break-words">
                                      <PuckIcon
                                        name={
                                          item.icon && item.icon !== "none"
                                            ? item.icon
                                            : "calendar"
                                        }
                                        className="size-3 shrink-0"
                                      />
                                      <span>{item.location}</span>
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );

                        return (
                          <li key={item.id || `${index}-${item.title}`}>
                            {onSelectEvent ? (
                              <button
                                type="button"
                                onClick={() => onSelectEvent(item, index)}
                                className={cn(
                                  "flex w-full rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
                                  isNext
                                    ? "border-primary/30 bg-primary/5 ring-1 ring-primary/15 hover:bg-primary/10"
                                    : "border-border/80 bg-background hover:bg-muted/40"
                                )}
                              >
                                {body}
                              </button>
                            ) : (
                              <div
                                className={cn(
                                  "flex rounded-lg border p-3",
                                  isNext
                                    ? "border-primary/30 bg-primary/5 ring-1 ring-primary/15"
                                    : "border-border/80 bg-background"
                                )}
                              >
                                {body}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
