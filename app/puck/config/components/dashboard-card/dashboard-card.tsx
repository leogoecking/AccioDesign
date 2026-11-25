import type { PuckComponent, Slot } from "@puckeditor/core";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CompoundBadge,
  type CompoundBadgeProps,
} from "~/puck/components/badge";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import { ErrorBoundary } from "~/puck/components/error-boundary";
import { PuckIcon, type IconName } from "~/puck/components/icon";

export interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: IconName;
  badge?: CompoundBadgeProps;
  size: "default" | "sm";
  bodyText?: string;
  content?: Slot;
  footerButton?: CompoundButtonProps;
}

export const DashboardCard: PuckComponent<DashboardCardProps> = ({
  title,
  description,
  icon = "none",
  badge,
  size = "default",
  bodyText,
  content: Content,
  footerButton,
}) => {
  const hasIcon = Boolean(icon && icon !== "none");

  return (
    <ErrorBoundary>
      <Card size={size} className="h-full justify-between">
        <CardHeader>
          <div className="flex items-start gap-3">
            {hasIcon ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <PuckIcon name={icon} className="size-4" />
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <CardTitle>{title}</CardTitle>
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>
          </div>
          {badge?.label ? (
            <CardAction>
              <CompoundBadge
                label={badge.label}
                url={badge.url}
                variant={badge.variant}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        {(bodyText || Content) ? (
          <CardContent className="flex flex-col gap-3">
            {bodyText ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bodyText}
              </p>
            ) : null}
            {Content ? <Content className="flex flex-col gap-3" /> : null}
          </CardContent>
        ) : null}
        {footerButton?.label ? (
          <CardFooter>
            <CompoundButton
              label={footerButton.label}
              url={footerButton.url}
              variant={footerButton.variant}
              size={footerButton.size}
              icon={footerButton.icon}
            />
          </CardFooter>
        ) : null}
      </Card>
    </ErrorBoundary>
  );
};
