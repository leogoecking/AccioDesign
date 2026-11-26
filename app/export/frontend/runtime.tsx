import { createContext, createElement, useContext, useState, type ComponentType } from "react";
import { RootLayout } from "~/puck/components/root/root-layout";
import { normalizeNavigationMode, normalizeVisualDensity } from "~/puck/context/visual-layout-context";
import { mapSlots, readBlocks, type DocumentBlock, type SlotFields } from "./document";

export type ComponentRegistry = Record<string, {
  view: ComponentType<never>;
  slots: SlotFields;
}>;

type SlotView = ComponentType<{ className?: string }>;
const SlotContext = createContext<{
  registry: ComponentRegistry;
  content: ReadonlyMap<string, DocumentBlock[]>;
} | null>(null);

function createSlot(address: string): SlotView {
  return function Slot({ className }) {
    const context = useContext(SlotContext);
    const blocks = context?.content.get(address);
    if (!context || !blocks) throw new Error("Slot fora do bloco de origem.");
    return <div className={className}><Blocks blocks={blocks} registry={context.registry} /></div>;
  };
}

function Block({ block, registry }: { block: DocumentBlock; registry: ComponentRegistry }) {
  const entry = Object.hasOwn(registry, block.type) ? registry[block.type] : undefined;
  if (!entry) throw new Error("Componente fora do registro exportado: " + block.type);

  const [slotTypes, setSlotTypes] = useState(() => new Map<string, SlotView>());
  const nextSlotTypes = new Map<string, SlotView>();
  const content = new Map<string, DocumentBlock[]>();
  let addedSlot = false;
  const props = mapSlots(block.props, entry.slots, (blocks, address) => {
    const existing = slotTypes.get(address);
    if (!existing) addedSlot = true;
    const slot = existing ?? createSlot(address);
    nextSlotTypes.set(address, slot);
    content.set(address, blocks);
    return slot;
  });

  // Keep only live types in state. Slots read the current render's data through context.
  if (addedSlot || nextSlotTypes.size !== slotTypes.size) setSlotTypes(nextSlotTypes);

  // The registry is verified at export time; the document supplies each view's props.
  return (
    <SlotContext.Provider value={{ registry, content }}>
      {createElement(entry.view as ComponentType<Record<string, unknown>>, props)}
    </SlotContext.Provider>
  );
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
      layoutWidth={root?.layoutWidth}
    >
      <div><Blocks blocks={readBlocks(data.content)} registry={registry} /></div>
    </RootLayout>
  );
}
