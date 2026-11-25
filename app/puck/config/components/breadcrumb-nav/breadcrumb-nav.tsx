import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
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
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

export interface BreadcrumbNavProps {
  items: { label: string; url: string }[];
  currentPage: string;
  badge?: CompoundBadgeProps;
  action?: CompoundButtonProps;
  padding?: CompoundContainerProps["padding"];
}

export const BreadcrumbNav = ({
  items = [],
  currentPage,
  badge,
  action,
  padding,
}: BreadcrumbNavProps) => {
  const isEditorMode = useIsEditorMode();

  return (
    <CompoundContainer padding={padding}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, index) => (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={item.url || "#"}
                      onClick={
                        isEditorMode ? (e) => e.preventDefault() : undefined
                      }
                    >
                      {item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {badge?.label ? (
            <CompoundBadge
              label={badge.label}
              url={badge.url}
              variant={badge.variant}
            />
          ) : null}
        </div>
        {action?.label ? (
          <CompoundButton
            label={action.label}
            url={action.url}
            variant={action.variant}
            size={action.size}
            icon={action.icon}
          />
        ) : null}
      </div>
    </CompoundContainer>
  );
};
