import type { PuckComponent, Slot } from "@puckeditor/core";
import { cn } from "cn";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";
import { useLayoutMode } from "~/puck/context/layout-mode-context";

export interface SidebarNavItem {
  label: string;
  url?: string;
  icon?: IconName;
  badge?: string;
  active?: boolean;
}

export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

export interface AppSidebarProps {
  brandName: string;
  brandSubtitle?: string;
  brandIcon?: IconName;
  groups: SidebarNavGroup[];
  user?: {
    name: string;
    role?: string;
    initials?: string;
  };
  bordered?: boolean;
  content: Slot;
}

function getAllNavItems(groups: SidebarNavGroup[]): SidebarNavItem[] {
  return groups.flatMap((group) => group.items || []);
}

export const AppSidebar: PuckComponent<AppSidebarProps> = ({
  brandName,
  brandSubtitle,
  brandIcon = "layout-dashboard",
  groups = [],
  user,
  bordered = true,
  content: Content,
}) => {
  const isEditorMode = useIsEditorMode();
  const { navigationMode, density } = useLayoutMode();
  const flatItems = getAllNavItems(groups);

  const mainPaddingClass =
    density === "compact"
      ? "p-3 md:p-4"
      : density === "comfortable"
        ? "p-5 md:p-8"
        : "p-4 md:p-6";

  const preventInEditor = (event: React.MouseEvent) => {
    if (isEditorMode) {
      event.preventDefault();
    }
  };

  const renderMobileStrip = (extraClassName = "md:hidden") => (
    <div className={cn("border-b bg-sidebar text-sidebar-foreground", extraClassName)}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <PuckIcon name={brandIcon} className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{brandName}</span>
            {brandSubtitle ? (
              <span className="truncate text-xs text-muted-foreground">
                {brandSubtitle}
              </span>
            ) : null}
          </div>
        </div>
        {user?.name ? (
          <Avatar size="sm">
            <AvatarFallback>
              {user.initials || user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      {flatItems.length > 0 ? (
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-1.5 overflow-x-auto border-t px-3 py-2"
        >
          {flatItems.map((item, idx) => (
            <a
              key={idx}
              href={item.url || "#"}
              onClick={preventInEditor}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <PuckIcon name={item.icon} className="size-3.5" />
              <span>{item.label}</span>
              {item.badge ? (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {item.badge}
                </Badge>
              ) : null}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-6 sm:py-4">
        <div
          data-testid="app-sidebar-shell"
          data-nav-mode={navigationMode}
          className={cn("overflow-hidden rounded-2xl bg-background", {
            "border shadow-sm": bordered,
          })}
        >
          {navigationMode === "topnav" ? (
            <div className="flex min-h-[520px] flex-col">
              <header className="border-b bg-sidebar px-4 py-3 text-sidebar-foreground">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <PuckIcon name={brandIcon} className="size-4" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold">{brandName}</span>
                      {brandSubtitle ? (
                        <span className="text-xs text-muted-foreground">
                          {brandSubtitle}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <nav
                    aria-label="Navegação superior"
                    className="order-3 flex w-full flex-wrap items-center gap-1 pt-1 lg:order-2 lg:w-auto lg:pt-0"
                  >
                    {flatItems.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url || "#"}
                        onClick={preventInEditor}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                          item.active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <PuckIcon name={item.icon} className="size-4" />
                        <span>{item.label}</span>
                        {item.badge ? (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[11px] tabular-nums"
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </a>
                    ))}
                  </nav>

                  {user?.name ? (
                    <div className="order-2 flex items-center gap-2.5 lg:order-3">
                      <Avatar size="sm">
                        <AvatarFallback>
                          {user.initials || user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                        <span className="truncate text-xs font-medium">
                          {user.name}
                        </span>
                        {user.role ? (
                          <span className="truncate text-[11px] text-muted-foreground">
                            {user.role}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </header>
              <main className={cn("min-w-0 flex-1 bg-background", mainPaddingClass)}>
                {Content ? <Content /> : null}
              </main>
            </div>
          ) : navigationMode === "rail" ? (
            <div className="flex min-h-[520px] flex-col md:flex-row">
              {renderMobileStrip("md:hidden")}
              <aside
                aria-label="Navegação compacta"
                className="hidden w-16 shrink-0 flex-col items-center justify-between border-r bg-sidebar py-3 text-sidebar-foreground md:flex"
              >
                <div className="flex flex-col items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                        <PuckIcon name={brandIcon} className="size-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {brandName}
                      {brandSubtitle ? ` — ${brandSubtitle}` : ""}
                    </TooltipContent>
                  </Tooltip>

                  <nav className="flex flex-col items-center gap-1.5 pt-2">
                    {flatItems.map((item, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <a
                            href={item.url || "#"}
                            onClick={preventInEditor}
                            aria-label={item.label}
                            className={cn(
                              "relative flex size-9 items-center justify-center rounded-lg transition-colors",
                              item.active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <PuckIcon
                              name={item.icon || "layers"}
                              className="size-4"
                            />
                            {item.badge ? (
                              <span
                                aria-hidden="true"
                                className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-sidebar-primary"
                              />
                            ) : null}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <span>{item.label}</span>
                          {item.badge ? ` (${item.badge})` : ""}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </nav>
                </div>

                {user?.name ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="pt-2">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {user.initials || user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {user.name}
                      {user.role ? ` · ${user.role}` : ""}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </aside>
              <main className={cn("min-w-0 flex-1 bg-background", mainPaddingClass)}>
                {Content ? <Content /> : null}
              </main>
            </div>
          ) : (
            <div className="flex min-h-[520px] flex-col">
              {renderMobileStrip("md:hidden")}
              <SidebarProvider className="min-h-[520px] w-full">
                <Sidebar collapsible="none" className="hidden h-auto min-h-full border-r md:flex">
                  <SidebarHeader className="border-b px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                        <PuckIcon name={brandIcon} className="size-4" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold">{brandName}</span>
                        {brandSubtitle ? (
                          <span className="text-xs text-muted-foreground">
                            {brandSubtitle}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </SidebarHeader>
                  <SidebarContent>
                    {groups.map((group, groupIndex) => (
                      <SidebarGroup key={groupIndex}>
                        {group.title ? (
                          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        ) : null}
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {group.items?.map((item, itemIndex) => (
                              <SidebarMenuItem key={itemIndex}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={Boolean(item.active)}
                                >
                                  <a
                                    href={item.url || "#"}
                                    onClick={preventInEditor}
                                  >
                                    <PuckIcon name={item.icon} className="size-4" />
                                    <span>{item.label}</span>
                                  </a>
                                </SidebarMenuButton>
                                {item.badge ? (
                                  <SidebarMenuBadge className="tabular-nums">
                                    {item.badge}
                                  </SidebarMenuBadge>
                                ) : null}
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    ))}
                  </SidebarContent>
                  {user?.name ? (
                    <SidebarFooter className="border-t p-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {user.initials || user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate text-xs font-medium">
                            {user.name}
                          </span>
                          {user.role ? (
                            <span className="truncate text-xs text-muted-foreground">
                              {user.role}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </SidebarFooter>
                  ) : null}
                </Sidebar>
                <SidebarInset className={cn("min-w-0 flex-1", mainPaddingClass)}>
                  {Content ? <Content /> : null}
                </SidebarInset>
              </SidebarProvider>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
