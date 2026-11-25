import { cn } from "cn";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import { PuckIcon, type IconName } from "~/puck/components/icon";

export interface CompoundCardProps {
  icon?: IconName;
  heading?: string;
  description?: string;
  button?: CompoundButtonProps;
  className?: string;
}

export const CompoundCard = ({
  icon,
  heading,
  description,
  button,
  className,
}: CompoundCardProps) => {
  const hasIcon = Boolean(icon && icon !== "none");

  return (
    <Card className={cn("justify-between", className)}>
      <CardHeader>
        {hasIcon ? (
          <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
            <PuckIcon name={icon} className="size-4" />
          </div>
        ) : null}
        {heading ? <CardTitle>{heading}</CardTitle> : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {button?.label ? (
        <CardFooter>
          <CompoundButton
            label={button.label}
            url={button.url}
            variant={button.variant}
            size={button.size}
            icon={button.icon}
          />
        </CardFooter>
      ) : (
        <CardContent className="hidden" />
      )}
    </Card>
  );
};
