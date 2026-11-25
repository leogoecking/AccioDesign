import { useEditorOverlayRef } from "~/puck/context/is-editor-mode-context";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  CompoundButton,
  type CompoundButtonProps,
} from "~/puck/components/button";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";

export interface FilterChipItem {
  label: string;
  active: boolean;
}

export interface FilterBarProps {
  searchPlaceholder: string;
  filters: FilterChipItem[];
  primaryAction?: CompoundButtonProps;
  secondaryAction?: CompoundButtonProps;
  padding?: CompoundContainerProps["padding"];
}

export const FilterBar = ({
  searchPlaceholder = "Pesquisar...",
  filters = [],
  primaryAction,
  secondaryAction,
  padding,
}: FilterBarProps) => {
  const overlayRef = useEditorOverlayRef();
  const [searchValue, setSearchValue] = useState("");
  const [activeState, setActiveState] = useState<boolean[]>(() =>
    filters.map((filter) => Boolean(filter.active))
  );

  useEffect(() => {
    setActiveState(filters.map((filter) => Boolean(filter.active)));
  }, [filters]);

  const toggleFilter = (index: number) => {
    setActiveState((prev) =>
      prev.map((current, itemIndex) => (itemIndex === index ? !current : current))
    );
  };

  return (
    <CompoundContainer padding={padding}>
      <Card size="sm">
        <CardContent className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                ref={overlayRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {filters.map((filter, index) => {
                const isActive = activeState[index] ?? filter.active;
                return (
                  <Button
                    key={`${filter.label}-${index}`}
                    ref={overlayRef}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => toggleFilter(index)}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
          {(secondaryAction?.label || primaryAction?.label) ? (
            <div className="flex flex-wrap items-center gap-2">
              {secondaryAction?.label ? (
                <CompoundButton
                  label={secondaryAction.label}
                  url={secondaryAction.url}
                  variant={secondaryAction.variant}
                  size={secondaryAction.size}
                  icon={secondaryAction.icon}
                />
              ) : null}
              {primaryAction?.label ? (
                <CompoundButton
                  label={primaryAction.label}
                  url={primaryAction.url}
                  variant={primaryAction.variant}
                  size={primaryAction.size}
                  icon={primaryAction.icon}
                />
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </CompoundContainer>
  );
};
