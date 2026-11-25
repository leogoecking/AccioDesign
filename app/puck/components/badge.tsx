import type { VariantProps } from "class-variance-authority";
import { MoveRightIcon } from "lucide-react";
import { cn } from "cn";
import { Badge, badgeVariants } from "~/components/ui/badge";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface CompoundBadgeProps {
  label: string;
  url?: string;
  variant?: BadgeVariant;
  className?: string;
}

export const CompoundBadge = ({
  label,
  url,
  variant = "default",
  className,
}: CompoundBadgeProps) => {
  const isEditorMode = useIsEditorMode();

  if (url) {
    return (
      <a
        href={url}
        onClick={isEditorMode ? (event) => event.preventDefault() : undefined}
        className={cn(badgeVariants({ variant }), "gap-1.5", className)}
      >
        {label}
        <MoveRightIcon className="size-3" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {label}
    </Badge>
  );
};
