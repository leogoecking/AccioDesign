import { useEditorOverlayRef } from "~/puck/context/is-editor-mode-context";
import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
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

export interface DataTableRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  status: string;
  statusVariant?: BadgeVariant;
}

export interface DataTableProps {
  title: string;
  description?: string;
  caption?: string;
  showSearch: boolean;
  searchPlaceholder: string;
  headers: {
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    status: string;
  };
  showColumn3: boolean;
  showColumn4: boolean;
  showStatus: boolean;
  rows: DataTableRow[];
  padding?: CompoundContainerProps["padding"];
}

export const DataTable = ({
  title,
  description,
  caption,
  showSearch = true,
  searchPlaceholder = "Filtrar registros...",
  headers,
  showColumn3 = true,
  showColumn4 = true,
  showStatus = true,
  rows = [],
  padding,
}: DataTableProps) => {
  const overlayRef = useEditorOverlayRef();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRows = normalizedQuery
    ? rows.filter((row) =>
        [row.col1, row.col2, row.col3, row.col4, row.status]
          .filter(Boolean)
          .some((cell) => cell.toLowerCase().includes(normalizedQuery))
      )
    : rows;

  return (
    <CompoundContainer padding={padding}>
      <Card>
        <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {showSearch ? (
            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                ref={overlayRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <Table>
            {caption ? <TableCaption>{caption}</TableCaption> : null}
            <TableHeader>
              <TableRow>
                <TableHead>{headers.col1}</TableHead>
                <TableHead>{headers.col2}</TableHead>
                {showColumn3 ? <TableHead>{headers.col3}</TableHead> : null}
                {showColumn4 ? <TableHead>{headers.col4}</TableHead> : null}
                {showStatus ? (
                  <TableHead className="text-right">{headers.status}</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.col1}</TableCell>
                    <TableCell>{row.col2}</TableCell>
                    {showColumn3 ? <TableCell>{row.col3}</TableCell> : null}
                    {showColumn4 ? (
                      <TableCell className="text-muted-foreground">
                        {row.col4}
                      </TableCell>
                    ) : null}
                    {showStatus ? (
                      <TableCell className="text-right">
                        {row.status ? (
                          <Badge variant={row.statusVariant || "secondary"}>
                            {row.status}
                          </Badge>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      2 +
                      (showColumn3 ? 1 : 0) +
                      (showColumn4 ? 1 : 0) +
                      (showStatus ? 1 : 0)
                    }
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CompoundContainer>
  );
};
