import { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { BadgeVariant } from "~/puck/components/badge";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import { ErrorBoundary } from "~/puck/components/error-boundary";

export interface TeamMemberItem {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
  status: string;
  statusVariant?: BadgeVariant;
}

export interface UserSummaryCardProps {
  title: string;
  description?: string;
  members: TeamMemberItem[];
  footerButton?: CompoundButtonProps;
}

export const UserSummaryCard = ({
  title,
  description,
  members = [],
  footerButton,
}: UserSummaryCardProps) => {
  return (
    <ErrorBoundary>
      <Card className="h-full justify-between">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {members.map((member, index) => (
            <Fragment key={index}>
              {index > 0 ? <Separator /> : null}
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    {member.avatarUrl ? (
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                    ) : null}
                    <AvatarFallback>
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {member.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {member.role}
                    </span>
                  </div>
                </div>
                {member.status ? (
                  <Badge variant={member.statusVariant || "secondary"}>
                    {member.status}
                  </Badge>
                ) : null}
              </div>
            </Fragment>
          ))}
        </CardContent>
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
