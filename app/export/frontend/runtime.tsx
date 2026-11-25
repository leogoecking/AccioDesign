import { createElement, type ComponentType } from "react";
import { RootLayout } from "~/puck/components/root/root-layout";
import { normalizeNavigationMode, normalizeVisualDensity } from "~/puck/context/visual-layout-context";
import { mapSlots, readBlocks, type DocumentBlock, type SlotFields } from "./document";

export type ComponentRegistry = Record<string, {
  view: ComponentType<never>;
  slots: SlotFields;
}>;

function Block({ block, registry }: { block: DocumentBlock; registry: ComponentRegistry }) {
  const entry = Object.hasOwn(registry, block.type) ? registry[block.type] : undefined;
  if (!entry) throw new Error("Componente fora do registro exportado: " + block.type);

  const props = mapSlots(block.props, entry.slots, blocks => (
    function Slot({ className }: { className?: string }) {
      return <div className={className}><Blocks blocks={blocks} registry={registry} /></div>;
    }
  ));
  // The registry is verified at export time; the document supplies each view's props.
  return createElement(entry.view as ComponentType<Record<string, unknown>>, props);
}

function Blocks({ blocks, registry }: { blocks: DocumentBlock[]; registry: ComponentRegistry }) {
  return blocks.map((block, index) => (
    <Block key={typeof block.props.id === "string" ? block.props.id : index} block={block} registry={registry} />
  ));
}

export function DesignView({ data, registry, theme }: {
  data: { root?: { props?: Record<string, unknown> }; content: unknown };
  registry: ComponentRegistry;
  theme: { activeMode: "light" | "dark"; presetId: string };
}) {
  const root = data.root?.props;
  return (
    <RootLayout
      surface={root?.surface === "default" ? "default" : "muted"}
      navigationMode={normalizeNavigationMode(root?.navigationMode)}
      density={normalizeVisualDensity(root?.density)}
      mode={theme.activeMode}
      presetId={theme.presetId}
    >
      <div><Blocks blocks={readBlocks(data.content)} registry={registry} /></div>
    </RootLayout>
  );
}
