import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, CheckCheck, Circle } from "lucide-react";
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
import { FallbackAvatar } from "~/components/ui/fallback-avatar";
import { Separator } from "~/components/ui/separator";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";

export type NotificationPriority = "alta" | "normal" | "baixa";

export interface NotificationItem {
  id?: string;
  title: string;
  description?: string;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  mediaType?: "icon" | "avatar";
  icon?: IconName;
  senderName?: string;
  senderAvatarUrl?: string;
  category?: string;
}

export interface NotificationListViewProps {
  title: string;
  description?: string;
  grouped?: boolean;
  showReadToggle?: boolean;
  showMarkAllAction?: boolean;
  items: NotificationItem[];
  emptyMessage?: string;
  padding?: CompoundContainerProps["padding"];
  onToggleRead?: (item: NotificationItem, index: number) => void;
  onMarkAllRead?: (items: NotificationItem[]) => void;
  onSelectNotification?: (item: NotificationItem, index: number) => void;
}

const PRIORITY_BADGE: Record<
  NotificationPriority,
  { label: string; variant: "destructive" | "secondary" | "outline" }
> = {
  alta: { label: "Alta", variant: "destructive" },
  normal: { label: "Normal", variant: "secondary" },
  baixa: { label: "Baixa", variant: "outline" },
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface NotificationReadState {
  externalReadByKey: Record<string, boolean>;
  overrides: Record<string, boolean>;
}

export function resolveNotificationKeys(items: NotificationItem[]): string[] {
  const counts = new Map<string, number>();
  return items.map((item, index) => {
    const base = item.id || `${index}-${item.title}`;
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return seen === 0 ? base : `${base}::${seen}`;
  });
}

export function buildExternalReadMap(
  items: NotificationItem[]
): Record<string, boolean> {
  const keys = resolveNotificationKeys(items);
  return Object.fromEntries(
    items.map((item, index) => [keys[index], Boolean(item.read)])
  );
}

function areReadMapsEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.hasOwn(b, key) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export function reconcileNotificationReadState(
  prevState: NotificationReadState,
  nextExternalReadByKey: Record<string, boolean>
): NotificationReadState {
  if (areReadMapsEqual(prevState.externalReadByKey, nextExternalReadByKey)) {
    return prevState;
  }

  const nextOverrides: Record<string, boolean> = {};
  for (const [key, overrideValue] of Object.entries(prevState.overrides)) {
    if (
      Object.hasOwn(nextExternalReadByKey, key) &&
      Object.hasOwn(prevState.externalReadByKey, key) &&
      prevState.externalReadByKey[key] === nextExternalReadByKey[key] &&
      overrideValue !== nextExternalReadByKey[key]
    ) {
      nextOverrides[key] = overrideValue;
    }
  }

  return {
    externalReadByKey: nextExternalReadByKey,
    overrides: nextOverrides,
  };
}

type PendingFocusTarget =
  | { type: "toggle"; key: string }
  | { type: "region-first" }
  | null;

export const NotificationList = ({
  title,
  description,
  grouped = true,
  showReadToggle = true,
  showMarkAllAction = true,
  items = [],
  emptyMessage = "Nenhuma notificação pendente no momento.",
  padding,
  onToggleRead,
  onMarkAllRead,
  onSelectNotification,
}: NotificationListViewProps) => {
  const safeItems = Array.isArray(items) ? items : [];
  const keys = resolveNotificationKeys(safeItems);
  const externalReadByKey = buildExternalReadMap(safeItems);

  const [readState, setReadState] = useState<NotificationReadState>(() => ({
    externalReadByKey,
    overrides: {},
  }));

  const syncedReadState = reconcileNotificationReadState(
    readState,
    externalReadByKey
  );
  if (syncedReadState !== readState) {
    setReadState(syncedReadState);
  }

  const regionRef = useRef<HTMLDivElement | null>(null);
  const markAllButtonRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusRef = useRef<PendingFocusTarget>(null);

  useIsomorphicLayoutEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;
    pendingFocusRef.current = null;

    const regionEl = regionRef.current;
    if (!regionEl) return;

    if (pendingFocus.type === "toggle") {
      const toggleButtons = Array.from(
        regionEl.querySelectorAll<HTMLButtonElement>('button[data-slot="toggle-read"]')
      );
      const targetButton =
        toggleButtons.find(
          (button) => button.dataset.notificationKey === pendingFocus.key
        ) ?? toggleButtons[0];
      if (targetButton && document.activeElement !== targetButton) {
        targetButton.focus({ preventScroll: true });
        return;
      }
      if (!targetButton && document.activeElement !== regionEl) {
        regionEl.focus({ preventScroll: true });
      }
      return;
    }

    const firstToggle = regionEl.querySelector<HTMLButtonElement>(
      'button[data-slot="toggle-read"]'
    );
    if (firstToggle) {
      firstToggle.focus({ preventScroll: true });
    } else if (document.activeElement !== regionEl) {
      regionEl.focus({ preventScroll: true });
    }
  });

  const resolvedEntries = safeItems.map((item, index) => {
    const key = keys[index];
    const isRead = Object.hasOwn(syncedReadState.overrides, key)
      ? syncedReadState.overrides[key]
      : Boolean(item.read);
    return { item, index, key, isRead };
  });

  const unreadCount = resolvedEntries.filter((entry) => !entry.isRead).length;

  const handleToggle = (entry: (typeof resolvedEntries)[number]) => {
    const nextRead = !entry.isRead;
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.dataset.slot === "toggle-read" &&
      document.activeElement.dataset.notificationKey === entry.key
    ) {
      pendingFocusRef.current = { type: "toggle", key: entry.key };
    }

    setReadState((prev) => {
      const current = reconcileNotificationReadState(prev, externalReadByKey);
      const nextOverrides = { ...current.overrides };
      if (nextRead === current.externalReadByKey[entry.key]) {
        delete nextOverrides[entry.key];
      } else {
        nextOverrides[entry.key] = nextRead;
      }
      return {
        externalReadByKey: current.externalReadByKey,
        overrides: nextOverrides,
      };
    });
    onToggleRead?.({ ...entry.item, read: nextRead }, entry.index);
  };

  const handleMarkAll = () => {
    if (
      typeof document !== "undefined" &&
      document.activeElement === markAllButtonRef.current
    ) {
      pendingFocusRef.current = { type: "region-first" };
    }

    setReadState((prev) => {
      const current = reconcileNotificationReadState(prev, externalReadByKey);
      const nextOverrides: Record<string, boolean> = {};
      for (const [key, externalRead] of Object.entries(current.externalReadByKey)) {
        if (!externalRead) {
          nextOverrides[key] = true;
        }
      }
      return {
        externalReadByKey: current.externalReadByKey,
        overrides: nextOverrides,
      };
    });
    onMarkAllRead?.(resolvedEntries.map((entry) => ({ ...entry.item, read: true })));
  };

  const sections = grouped
    ? [
        {
          id: "unread",
          label: `Não lidas (${unreadCount})`,
          entries: resolvedEntries.filter((entry) => !entry.isRead),
        },
        {
          id: "read",
          label: `Lidas (${resolvedEntries.length - unreadCount})`,
          entries: resolvedEntries.filter((entry) => entry.isRead),
        },
      ].filter((section) => section.entries.length > 0)
    : [{ id: "all", label: "", entries: resolvedEntries }];

  return (
    <CompoundContainer padding={padding}>
      <ErrorBoundary>
        <Card className="min-w-0">
          <CardHeader>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate">{title}</CardTitle>
                <Badge
                  variant={unreadCount > 0 ? "default" : "secondary"}
                  className="tabular-nums"
                >
                  {unreadCount} {unreadCount === 1 ? "não lida" : "não lidas"}
                </Badge>
              </div>
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>

            {showMarkAllAction && unreadCount > 0 ? (
              <CardAction>
                <button
                  ref={markAllButtonRef}
                  type="button"
                  data-slot="mark-all-read"
                  onClick={handleMarkAll}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                >
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                  <span>Marcar todas</span>
                </button>
              </CardAction>
            ) : null}
          </CardHeader>

          <CardContent className="min-w-0">
            {resolvedEntries.length === 0 ? (
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
                ref={regionRef}
                role="region"
                aria-label={title || "Central de notificações"}
                tabIndex={-1}
                className="flex flex-col gap-5 focus:outline-none"
              >
                {sections.map((section) => (
                  <div
                    key={section.id}
                    data-section={section.id}
                    className="space-y-2"
                  >
                    {section.label ? (
                      <h3 className="text-xs font-medium text-muted-foreground">
                        {section.label}
                      </h3>
                    ) : null}

                    <ul className="overflow-hidden rounded-lg border border-border/80">
                      {section.entries.map((entry, idx) => {
                        const { item, key, isRead } = entry;
                        const priorityMeta =
                          PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE.normal;
                        const useAvatar = item.mediaType === "avatar";

                        const itemMain = (
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            {useAvatar ? (
                              <FallbackAvatar
                                name={item.senderName || item.title}
                                src={item.senderAvatarUrl}
                                size="sm"
                                decorative
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                                  isRead
                                    ? "border-border bg-muted text-muted-foreground"
                                    : "border-primary/30 bg-primary/10 text-primary"
                                )}
                              >
                                <PuckIcon
                                  name={
                                    item.icon && item.icon !== "none"
                                      ? item.icon
                                      : "bell"
                                  }
                                  className="size-3.5"
                                />
                              </span>
                            )}

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  {!isRead ? (
                                    <span
                                      aria-hidden="true"
                                      className="size-2 shrink-0 rounded-full bg-primary"
                                    />
                                  ) : null}
                                  <span
                                    className={cn(
                                      "min-w-0 text-sm break-words",
                                      isRead
                                        ? "font-normal text-muted-foreground"
                                        : "font-medium text-foreground"
                                    )}
                                  >
                                    {item.title}
                                  </span>
                                </div>
                                <time className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                                  {item.timestamp}
                                </time>
                              </div>

                              {item.description ? (
                                <p className="text-xs text-muted-foreground break-words">
                                  {item.description}
                                </p>
                              ) : null}

                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <Badge
                                  variant={priorityMeta.variant}
                                  className="h-5 px-2 text-[11px]"
                                >
                                  {priorityMeta.label}
                                </Badge>
                                {item.category ? (
                                  <span className="text-[11px] text-muted-foreground">
                                    {item.category}
                                  </span>
                                ) : null}
                                {item.senderName ? (
                                  <span className="text-[11px] text-muted-foreground">
                                    · {item.senderName}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );

                        return (
                          <Fragment key={key}>
                            {idx > 0 ? <Separator /> : null}
                            <li
                              data-slot="notification-item"
                              data-read={String(isRead)}
                              className={cn(
                                "flex min-w-0 items-start justify-between gap-3 px-3.5 py-3 transition-colors motion-reduce:transition-none",
                                isRead ? "bg-background" : "bg-muted/25"
                              )}
                            >
                              {onSelectNotification ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectNotification(
                                      { ...item, read: isRead },
                                      entry.index
                                    )
                                  }
                                  className="flex min-w-0 flex-1 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                  {itemMain}
                                </button>
                              ) : (
                                itemMain
                              )}

                              {showReadToggle ? (
                                <button
                                  type="button"
                                  data-slot="toggle-read"
                                  data-notification-key={key}
                                  onClick={() => handleToggle(entry)}
                                  aria-label={
                                    isRead
                                      ? `Marcar "${item.title}" como não lida`
                                      : `Marcar "${item.title}" como lida`
                                  }
                                  title={
                                    isRead
                                      ? "Marcar como não lida"
                                      : "Marcar como lida"
                                  }
                                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                                >
                                  {isRead ? (
                                    <Circle className="size-3" aria-hidden="true" />
                                  ) : (
                                    <Check className="size-3.5" aria-hidden="true" />
                                  )}
                                </button>
                              ) : null}
                            </li>
                          </Fragment>
                        );
                      })}
                    </ul>
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
