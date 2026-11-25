import type { PuckComponent, Slot } from "@puckeditor/core";
import { cn } from "cn";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

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

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-4">
        <div
          className={cn("overflow-hidden rounded-2xl bg-background", {
            "border shadow-sm": bordered,
          })}
        >
          <SidebarProvider className="min-h-[520px] w-full">
            <Sidebar collapsible="none" className="border-r">
              <SidebarHeader className="border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
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
                                onClick={
                                  isEditorMode
                                    ? (event) => event.preventDefault()
                                    : undefined
                                }
                              >
                                <PuckIcon name={item.icon} className="size-4" />
                                <span>{item.label}</span>
                              </a>
                            </SidebarMenuButton>
                            {item.badge ? (
                              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
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
            <SidebarInset className="p-6">
              {Content ? <Content /> : null}
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
};
