import { Separator } from "~/components/ui/separator";
import {
  CompoundBadge,
  type CompoundBadgeProps,
} from "~/puck/components/badge";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: CompoundBadgeProps;
  actions?: CompoundButtonProps[];
  showSeparator?: boolean;
  padding?: CompoundContainerProps["padding"];
}

export const PageHeader = ({
  title,
  subtitle,
  badge,
  actions = [],
  showSeparator = true,
  padding,
}: PageHeaderProps) => {
  return (
    <CompoundContainer padding={padding}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                {title}
              </h1>
              {badge?.label ? (
                <CompoundBadge
                  label={badge.label}
                  url={badge.url}
                  variant={badge.variant}
                />
              ) : null}
            </div>
            {subtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {Array.isArray(actions) && actions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {actions
                .filter((action) => Boolean(action.label))
                .map((action, index) => (
                  <CompoundButton
                    key={index}
                    label={action.label}
                    url={action.url}
                    variant={action.variant}
                    size={action.size}
                    icon={action.icon}
                  />
                ))}
            </div>
          ) : null}
        </div>
        {showSeparator ? <Separator /> : null}
      </div>
    </CompoundContainer>
  );
};
