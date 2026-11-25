import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Button, buttonVariants } from "~/components/ui/button";
import { PuckIcon, type IconName } from "~/puck/components/icon";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface CompoundButtonProps {
  label: string;
  url?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const CompoundButton = (props: CompoundButtonProps) => {
  const isEditorMode = useIsEditorMode();
  const isIconSize =
    props.size === "icon" ||
    props.size === "icon-xs" ||
    props.size === "icon-sm" ||
    props.size === "icon-lg";

  const content = (
    <>
      {!isIconSize && props.label}
      <PuckIcon name={props.icon} className="size-4" />
    </>
  );

  if (props.url) {
    return (
      <a
        onClick={
          !isEditorMode
            ? undefined
            : (event) => {
                event.preventDefault();
              }
        }
        href={props.url}
        className={cn(
          buttonVariants({ variant: props.variant, size: props.size }),
          "gap-2",
          props.className
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <Button
      variant={props.variant}
      size={props.size}
      className={cn("gap-2", props.className)}
      type={props.type ?? "button"}
    >
      {content}
    </Button>
  );
};
