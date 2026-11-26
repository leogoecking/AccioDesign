import { useEditorOverlayRef } from "~/puck/context/is-editor-mode-context";
import { Fragment, useState } from "react";
import { Menu, MoveRight, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

type NavigationLink = { label: string };

type SubmenuLink = NavigationLink & {
  url: string;
};

type SecondaryNavigationItem = NavigationLink & {
  url: string;
  variant?: CompoundButtonProps["variant"];
  icon?: CompoundButtonProps["icon"];
  divider?: boolean;
  isHiddenOnMobile?: boolean;
};

type NavigationItem = NavigationLink & {
  url?: string;
  description?: string;
  cta?: CompoundButtonProps;
  items?: SubmenuLink[];
};

export interface HeaderProps {
  companyName: string;
  primaryNavigation?: NavigationItem[];
  secondaryNavigation?: SecondaryNavigationItem[];
}

export const Header = ({
  companyName,
  primaryNavigation,
  secondaryNavigation,
}: HeaderProps) => {
  const overlayRef = useEditorOverlayRef();
  const [isOpen, setOpen] = useState(false);
  const isEditorMode = useIsEditorMode();

  return (
    <ErrorBoundary>
      <header className="@container/header sticky top-0 left-0 z-40 w-full min-w-0 border-b bg-background/95 backdrop-blur-sm">
        <div className="accio-section container relative mx-auto flex min-h-16 flex-row items-center justify-between gap-4 @min-[1024px]/header:grid @min-[1024px]/header:grid-cols-3">
          <div className="hidden min-w-0 flex-row items-center justify-start gap-2 @min-[1024px]/header:flex">
            {Array.isArray(primaryNavigation) &&
            primaryNavigation.length > 0 ? (
              <NavigationMenu className="flex min-w-0 items-start justify-start">
                <NavigationMenuList className="flex min-w-0 flex-row flex-wrap justify-start gap-1">
                  {primaryNavigation.map((item, index) => (
                    <NavigationMenuItem key={index} className="min-w-0 max-w-full">
                      {item.url ? (
                        <NavigationMenuLink asChild>
                          <CompoundButton
                            url={item.url}
                            label={item.label}
                            variant="ghost"
                          />
                        </NavigationMenuLink>
                      ) : (
                        <>
                          <NavigationMenuTrigger
                            className="h-auto min-h-9 max-w-full whitespace-normal text-sm font-medium"
                            ref={overlayRef}
                          >
                            {item.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="!w-[440px] p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex h-full flex-col justify-between">
                                <div className="flex flex-col gap-1">
                                  <p className="text-sm font-semibold">
                                    {item.label}
                                  </p>
                                  {item.description ? (
                                    <p className="text-xs text-muted-foreground">
                                      {item.description}
                                    </p>
                                  ) : null}
                                </div>
                                {item.cta?.url ? (
                                  <CompoundButton
                                    label={item.cta.label}
                                    url={item.cta.url}
                                    variant={item.cta.variant}
                                    size={item.cta.size}
                                    icon={item.cta.icon}
                                    className="mt-6"
                                  />
                                ) : null}
                              </div>
                              <div className="flex h-full flex-col justify-end gap-1 text-sm">
                                {item.items?.map((subItem, subIndex) => (
                                  <NavigationMenuLink
                                    key={subIndex}
                                    href={subItem.url}
                                    onClick={
                                      isEditorMode
                                        ? (e) => e.preventDefault()
                                        : undefined
                                    }
                                    className="flex flex-row items-center justify-between rounded-xl px-3 py-2 hover:bg-muted"
                                  >
                                    <span>{subItem.label}</span>
                                    <MoveRight className="size-4 text-muted-foreground" />
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}
          </div>
          <div className="flex min-w-0 @min-[1024px]/header:justify-center">
            <p className="font-heading text-base font-semibold tracking-tight">
              {companyName}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            {secondaryNavigation?.map((item, index) => (
              <Fragment key={index}>
                <CompoundButton
                  label={item.label}
                  variant={item.variant}
                  icon={item.icon}
                  url={item.url}
                  className={cn({
                    "hidden @min-[768px]/header:inline-flex": item.isHiddenOnMobile,
                  })}
                />
                {item.divider ? (
                  <div className="hidden h-5 border-e @min-[768px]/header:inline" />
                ) : null}
              </Fragment>
            ))}
          </div>
          <div className="flex shrink-0 items-center justify-end @min-[1024px]/header:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(!isOpen)}
              ref={overlayRef}
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
            {isOpen && (
              <div className="accio-section container absolute top-full right-0 flex w-full flex-col gap-6 border-t bg-background py-4 shadow-lg">
                {primaryNavigation?.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    {item.url ? (
                      <a
                        href={item.url}
                        className="flex items-center justify-between text-base font-medium"
                        onClick={(e) => {
                          if (isEditorMode) e.preventDefault();
                          setOpen(false);
                        }}
                      >
                        <span>{item.label}</span>
                        <MoveRight className="size-4 text-muted-foreground" />
                      </a>
                    ) : (
                      <p className="text-base font-medium">{item.label}</p>
                    )}
                    {item.items?.map((subItem, subIndex) => (
                      <a
                        key={subIndex}
                        href={subItem.url}
                        className="flex items-center justify-between text-sm text-muted-foreground"
                        onClick={(e) => {
                          if (isEditorMode) e.preventDefault();
                          setOpen(false);
                        }}
                      >
                        <span>{subItem.label}</span>
                        <MoveRight className="size-4" />
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
    </ErrorBoundary>
  );
};
