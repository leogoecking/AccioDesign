import type { ReactNode } from "react";
import { cn } from "cn";
import { ErrorBoundary } from "~/puck/components/error-boundary";

export type PaddingLevel = "none" | "small" | "medium" | "large";

export interface CompoundContainerProps {
  children: ReactNode;
  padding?: {
    top?: PaddingLevel;
    bottom?: PaddingLevel;
  };
  fullWidth?: boolean;
  className?: string;
}

export const CompoundContainer = ({
  children,
  padding,
  fullWidth = false,
  className,
}: CompoundContainerProps) => {
  const { top = "small", bottom = "small" } = padding ?? {};

  return (
    <ErrorBoundary>
      <div
        className={cn(
          "w-full",
          {
            "pt-4 lg:pt-6": top === "small",
            "pb-4 lg:pb-6": bottom === "small",
            "pt-8 lg:pt-12": top === "medium",
            "pb-8 lg:pb-12": bottom === "medium",
            "pt-12 lg:pt-20": top === "large",
            "pb-12 lg:pb-20": bottom === "large",
          },
          className
        )}
      >
        <div className={fullWidth ? "w-full px-4 lg:px-6" : "container mx-auto"}>
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
};
