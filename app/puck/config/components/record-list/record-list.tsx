import { Fragment } from "react";
import { cn } from "cn";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CopyButton } from "~/components/ui/copy-button";
import { FallbackAvatar } from "~/components/ui/fallback-avatar";
import { Separator } from "~/components/ui/separator";
import type { BadgeVariant } from "~/puck/components/badge";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

export interface RecordListItem {
  id?: string;
  title: string;
  description?: string;
  code?: string;
  value?: string;
  date?: string;
  status?: string;
  statusVariant?: BadgeVariant;
  avatarName?: string;
  avatarUrl?: string;
  icon?: IconName;
  actionLabel?: string;
  actionUrl?: string;
}

export interface RecordListViewProps {
  title: string;
  description?: string;
  badgeLabel?: string;
  variant?: "default" | "compact";
  mediaType?: "avatar" | "icon";
  showCopyCode?: boolean;
  items: RecordListItem[];
  footerAction?: CompoundButtonProps;
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
  onItemAction?: (item: RecordListItem, index: number) => void;
  onCopyCode?: (code: string, item: RecordListItem) => void;
}

export const RecordList = ({
  title,
  description,
  badgeLabel,
  variant = "default",
  mediaType = "avatar",
  showCopyCode = true,
  items = [],
  footerAction,
  emptyMessage = "Nenhum registro encontrado.",
  padding,
  onItemAction,
  onCopyCode,
}: RecordListViewProps) => {
  const isEditorMode = useIsEditorMode();
  const safeItems = Array.isArray(items) ? items : [];
  const isCompact = variant === "compact";

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
              <ul
                aria-label={title || "Lista de registros"}
                className="flex flex-col"
              >
                {safeItems.map((item, index) => {
                  const displayName = item.avatarName || item.title || "Registro";
                  const showItemAction = Boolean(item.actionLabel);

                  return (
                    <Fragment key={item.id || `${index}-${item.title}`}>
                      {index > 0 ? <Separator /> : null}
                      <li
                        className={cn(
                          "flex min-w-0 flex-col justify-between gap-3 @min-[540px]/section:flex-row @min-[540px]/section:items-center",
                          isCompact ? "py-2.5" : "py-3.5"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3 @min-[540px]/section:items-center">
                          {mediaType === "icon" ? (
                            <div
                              aria-hidden="true"
                              className={cn(
                                "flex shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground",
                                isCompact ? "size-7" : "size-9"
                              )}
                            >
                              <PuckIcon
                                name={item.icon && item.icon !== "none" ? item.icon : "file-text"}
                                className={isCompact ? "size-3.5" : "size-4"}
                              />
                            </div>
                          ) : (
                            <FallbackAvatar
                              name={displayName}
                              src={item.avatarUrl}
                              size={isCompact ? "sm" : "default"}
                              decorative
                            />
                          )}

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="min-w-0 text-sm font-medium text-foreground break-words">
                                {item.title}
                              </span>
                              {item.code ? (
                                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                                  <span>{item.code}</span>
                                </span>
                              ) : null}
                              {showCopyCode && item.code ? (
                                <CopyButton
                                  value={item.code}
                                  label={`Copiar código ${item.code}`}
                                  size="sm"
                                  className="size-6"
                                  onCopySuccess={(copied) => onCopyCode?.(copied, item)}
                                />
                              ) : null}
                            </div>

                            {item.description ? (
                              <p
                                className={cn(
                                  "text-xs text-muted-foreground break-words",
                                  isCompact && "line-clamp-1"
                                )}
                              >
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2.5 pl-10 @min-[540px]/section:justify-end @min-[540px]/section:pl-0">
                          {item.value || item.date ? (
                            <div className="flex flex-col text-left @min-[540px]/section:text-right">
                              {item.value ? (
                                <span className="text-sm font-medium text-foreground tabular-nums">
                                  {item.value}
                                </span>
                              ) : null}
                              {item.date ? (
                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                  {item.date}
                                </span>
                              ) : null}
                            </div>
                          ) : null}

                          {item.status ? (
                            <Badge variant={item.statusVariant || "secondary"}>
                              {item.status}
                            </Badge>
                          ) : null}

                          {showItemAction ? (
                            onItemAction ? (
                              <button
                                type="button"
                                onClick={() => onItemAction(item, index)}
                                className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                              >
                                {item.actionLabel}
                              </button>
                            ) : (
                              <a
                                href={item.actionUrl || "#"}
                                onClick={
                                  isEditorMode
                                    ? (event) => event.preventDefault()
                                    : undefined
                                }
                                className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                              >
                                {item.actionLabel}
                              </a>
                            )
                          ) : null}
                        </div>
                      </li>
                    </Fragment>
                  );
                })}
              </ul>
            )}
          </CardContent>

          {footerAction?.label ? (
            <CardFooter className="border-t pt-4">
              <CompoundButton
                label={footerAction.label}
                url={footerAction.url}
                variant={footerAction.variant || "outline"}
                size={footerAction.size || "sm"}
                icon={footerAction.icon}
              />
            </CardFooter>
          ) : null}
        </Card>
      </ErrorBoundary>
    </CompoundContainer>
  );
};
