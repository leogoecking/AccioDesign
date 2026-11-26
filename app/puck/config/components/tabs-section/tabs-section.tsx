import { useEditorOverlayRef } from "~/puck/context/is-editor-mode-context";
import type { VisualSlot } from "~/puck/components/visual-slot";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  CompoundContainer,
  type CompoundContainerProps,
} from "~/puck/components/container";

export interface TabSectionItem {
  id: string;
  label: string;
  badge?: string;
  content: VisualSlot;
}

export interface TabsSectionViewProps {
  variant: "default" | "line";
  tabs: TabSectionItem[];
  padding?: CompoundContainerProps["padding"];
}

export const TabsSection = ({
  variant = "default",
  tabs = [],
  padding,
}: TabsSectionViewProps) => {
  const overlayRef = useEditorOverlayRef();
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return <></>;
  }

  const firstTabValue = tabs[0]?.id || "tab-0";

  return (
    <CompoundContainer padding={padding}>
      <Tabs defaultValue={firstTabValue} className="w-full min-w-0">
        <TabsList variant={variant} className="h-auto max-w-full flex-wrap">
          {tabs.map((tab, index) => {
            const tabValue = tab.id || `tab-${index}`;
            return (
              <TabsTrigger
                key={tabValue}
                value={tabValue}
                ref={overlayRef}
                className="min-w-0 max-w-full whitespace-normal"
              >
                <span>{tab.label}</span>
                {tab.badge ? (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                    {tab.badge}
                  </Badge>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {tabs.map((tab, index) => {
          const tabValue = tab.id || `tab-${index}`;
          const Content = tab.content;
          return (
            <TabsContent key={tabValue} value={tabValue} className="pt-4">
              {Content ? <Content className="flex flex-col gap-4" /> : null}
            </TabsContent>
          );
        })}
      </Tabs>
    </CompoundContainer>
  );
};
