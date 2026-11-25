import { Separator } from "~/components/ui/separator";
import { CompoundContainer } from "~/puck/components/container";

export interface DividerProps {
  label?: string;
  spacing: "sm" | "md" | "lg";
}

export const Divider = ({ label, spacing = "md" }: DividerProps) => {
  const paddingMap = {
    sm: { top: "none", bottom: "none" },
    md: { top: "small", bottom: "small" },
    lg: { top: "medium", bottom: "medium" },
  } as const;

  return (
    <CompoundContainer padding={paddingMap[spacing]}>
      {label ? (
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <Separator className="flex-1" />
        </div>
      ) : (
        <Separator />
      )}
    </CompoundContainer>
  );
};
