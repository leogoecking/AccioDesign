import { cn } from "cn";
import {
  CompoundBadge,
  type CompoundBadgeProps,
} from "~/puck/components/badge";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import { PuckIcon } from "~/puck/components/icon";
import type { Feature } from "~/puck/types";

export interface CompoundContentProps {
  badge?: CompoundBadgeProps;
  heading?: string;
  description?: string;
  features?: Feature[];
  buttons?: CompoundButtonProps[];
  alignContent?: "start" | "center" | "end";
  className?: string;
}

interface CompoundContentPropsWithSpacing extends CompoundContentProps {
  spacing?: "normal" | "tight";
}

export const CompoundContent = ({
  badge,
  heading,
  description,
  features,
  buttons,
  alignContent = "start",
  className,
  spacing = "normal",
}: CompoundContentPropsWithSpacing) => {
  const colPositionClassNames = cn("flex flex-col", {
    "items-start": alignContent === "start",
    "items-center text-center": alignContent === "center",
    "items-end": alignContent === "end",
  });
  const rowPositionClassNames = cn("flex flex-row", {
    "justify-start": alignContent === "start",
    "justify-center": alignContent === "center",
    "justify-end": alignContent === "end",
  });
  const textAlignClassnames = cn({
    "text-start": alignContent === "start",
    "text-center": alignContent === "center",
    "text-end": alignContent === "end",
  });

  return (
    <div
      className={cn(
        {
          "gap-6": spacing === "normal",
          "gap-3": spacing === "tight",
        },
        colPositionClassNames,
        className
      )}
    >
      {!!heading || !!description || !!badge?.label || (features && features.length > 0) ? (
        <div className={cn("gap-3", colPositionClassNames)}>
          {badge?.label ? (
            <div>
              <CompoundBadge
                label={badge.label}
                variant={badge.variant}
                url={badge.url}
              />
            </div>
          ) : null}
          <div
            className={cn(colPositionClassNames, {
              "gap-3": spacing === "normal",
              "gap-2": spacing === "tight",
            })}
          >
            {heading ? (
              <h2
                className={cn(
                  "font-heading text-2xl font-semibold tracking-tight @min-[768px]/section:text-3xl @min-[1024px]/section:max-w-xl",
                  textAlignClassnames
                )}
              >
                {heading}
              </h2>
            ) : null}
            {description ? (
              <p
                className={cn(
                  "text-sm leading-relaxed text-muted-foreground md:text-base",
                  {
                    "@min-[1024px]/section:max-w-md":
                      alignContent === "start" || alignContent === "end",
                    "@min-[1024px]/section:max-w-xl": alignContent === "center",
                  },
                  textAlignClassnames
                )}
              >
                {description}
              </p>
            ) : null}
            {Array.isArray(features) && features.length > 0
              ? features.map((feature, index) => (
                  <div key={index} className="flex flex-row items-start gap-3 pt-1">
                    {feature.icon && feature.icon !== "none" ? (
                      <PuckIcon
                        name={feature.icon}
                        className="mt-0.5 size-5 shrink-0 text-primary"
                      />
                    ) : null}
                    <div className="flex flex-col text-start">
                      <p className="text-sm font-medium">{feature.name}</p>
                      {feature.description ? (
                        <div className="text-xs text-muted-foreground md:text-sm">
                          {feature.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
      {Array.isArray(buttons) && buttons.length > 0 ? (
        <div className={cn("flex-wrap gap-3", rowPositionClassNames)}>
          {buttons
            .filter((button) => !!button.label)
            .map((button, index) => (
              <CompoundButton
                key={index}
                label={button.label}
                url={button.url}
                variant={button.variant}
                size={button.size}
                icon={button.icon}
              />
            ))}
        </div>
      ) : null}
    </div>
  );
};
