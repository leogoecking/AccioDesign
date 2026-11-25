import { cn } from "cn";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon } from "~/puck/components/icon";

export type KanbanPriority = "alta" | "media" | "baixa";

export interface KanbanCardItem {
  code: string;
  title: string;
  description?: string;
  priority: KanbanPriority;
  assignee: string;
  assigneeInitials?: string;
  tag?: string;
  sla?: string;
}

export interface KanbanColumnItem {
  title: string;
  badge?: string;
  cards: KanbanCardItem[];
}

export interface KanbanBoardProps {
  title?: string;
  description?: string;
  columns: KanbanColumnItem[];
  padding?: CompoundContainerProps["padding"];
}

const PRIORITY_STYLES: Record<
  KanbanPriority,
  { label: string; variant: "destructive" | "secondary" | "outline" }
> = {
  alta: { label: "Alta", variant: "destructive" },
  media: { label: "Média", variant: "secondary" },
  baixa: { label: "Baixa", variant: "outline" },
};

export const KanbanBoard = ({
  title,
  description,
  columns = [],
  padding,
}: KanbanBoardProps) => {
  return (
    <CompoundContainer padding={padding}>
      <ErrorBoundary>
        <div className="flex flex-col gap-4">
          {title || description ? (
            <div className="flex flex-col gap-1">
              {title ? (
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((column, colIndex) => {
              const cards = column.cards || [];
              return (
                <section
                  key={colIndex}
                  aria-label={column.title}
                  className="flex flex-col gap-2.5 rounded-xl bg-muted/45 p-3"
                >
                  <header className="flex items-center justify-between gap-2 px-0.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {column.title}
                    </h3>
                    <Badge variant="outline" className="tabular-nums">
                      {column.badge || String(cards.length)}
                    </Badge>
                  </header>

                  <div className="flex flex-col gap-2.5">
                    {cards.map((item, cardIndex) => {
                      const priorityMeta =
                        PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.media;
                      const initials =
                        item.assigneeInitials ||
                        item.assignee
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                      return (
                        <Card key={cardIndex} size="sm" className="gap-2.5 py-3">
                          <CardHeader className="gap-1.5 px-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
                                {item.code}
                              </span>
                              <Badge
                                variant={priorityMeta.variant}
                                className="h-5 px-2 text-[11px]"
                              >
                                {priorityMeta.label}
                              </Badge>
                            </div>
                            <CardTitle className="text-sm leading-snug font-medium">
                              {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-2.5 px-3 pt-0">
                            {item.description ? (
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            ) : null}
                            <div className="flex items-center justify-between gap-2 border-t pt-2">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <Avatar size="sm" className="size-5">
                                  <AvatarFallback className="text-[10px]">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate text-xs text-muted-foreground">
                                  {item.assignee}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground tabular-nums"
                                )}
                              >
                                {item.sla ? (
                                  <>
                                    <PuckIcon name="clock" className="size-3" />
                                    <span>{item.sla}</span>
                                  </>
                                ) : item.tag ? (
                                  <span>{item.tag}</span>
                                ) : null}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
