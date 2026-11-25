export type DocumentBlock = { type: string; props: Record<string, unknown> };
export type SlotFields = {
  [name: string]: "slot" | { kind: "array" | "object"; fields: SlotFields };
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function readBlocks(value: unknown): DocumentBlock[] {
  if (!Array.isArray(value)) throw new Error("Conteúdo de slot inválido.");
  return value.map(block => {
    if (!isObject(block) || typeof block.type !== "string" || !isObject(block.props)) {
      throw new Error("Componente inválido no documento.");
    }
    return { type: block.type, props: block.props };
  });
}

// Walk only declared slots. Ordinary arrays can contain records with type/props too.
export function mapSlots(
  props: Record<string, unknown>,
  fields: SlotFields,
  visit: (blocks: DocumentBlock[]) => unknown,
  owned = true
): Record<string, unknown> {
  const result = { ...props };
  for (const [name, field] of Object.entries(fields)) {
    const value = Object.hasOwn(props, name) ? props[name] : undefined;
    if (field === "slot") {
      if (owned || Object.hasOwn(props, name)) result[name] = visit(readBlocks(value ?? []));
    } else if (field.kind === "array" && Array.isArray(value)) {
      result[name] = value.map(item => isObject(item) ? mapSlots(item, field.fields, visit, false) : item);
    } else if (field.kind === "object" && isObject(value)) {
      result[name] = mapSlots(value, field.fields, visit, false);
    }
  }
  return result;
}
