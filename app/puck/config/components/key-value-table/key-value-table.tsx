import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { BadgeVariant } from "~/puck/components/badge";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";

export interface KeyValueRow {
  label: string;
  value: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
}

export interface KeyValueTableProps {
  title: string;
  description?: string;
  keyHeader: string;
  valueHeader: string;
  rows: KeyValueRow[];
  padding?: CompoundContainerProps["padding"];
}

export const KeyValueTable = ({
  title,
  description,
  keyHeader = "Parâmetro",
  valueHeader = "Valor",
  rows = [],
  padding,
}: KeyValueTableProps) => {
  return (
    <CompoundContainer padding={padding}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{keyHeader}</TableHead>
                <TableHead className="text-right">{valueHeader}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-muted-foreground">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <span className="font-medium text-foreground">
                        {row.value}
                      </span>
                      {row.badge ? (
                        <Badge variant={row.badgeVariant || "secondary"}>
                          {row.badge}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CompoundContainer>
  );
};
