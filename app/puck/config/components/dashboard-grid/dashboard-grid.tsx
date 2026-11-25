import type { PuckComponent, Slot } from "@puckeditor/core";
import { cn } from "cn";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";

export interface DashboardGridProps {
  sectionTitle?: string;
  sectionDescription?: string;
  columns: "1" | "2" | "3" | "4";
  gap: "sm" | "md" | "lg";
  items: Slot;
  padding?: CompoundContainerProps["padding"];
}

export const DashboardGrid: PuckComponent<DashboardGridProps> = ({
  sectionTitle,
  sectionDescription,
  columns = "2",
  gap = "md",
  items: Items,
  padding,
}) => {
  const gridColsClass = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const gapClass = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
  }[gap];

  return (
    <CompoundContainer padding={padding}>
      <div className="flex flex-col gap-4">
        {sectionTitle || sectionDescription ? (
          <div className="flex flex-col gap-1">
            {sectionTitle ? (
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                {sectionTitle}
              </h2>
            ) : null}
            {sectionDescription ? (
              <p className="text-sm text-muted-foreground">
                {sectionDescription}
              </p>
            ) : null}
          </div>
        ) : null}
        {Items ? <Items className={cn("grid", gridColsClass, gapClass)} /> : null}
      </div>
    </CompoundContainer>
  );
};
