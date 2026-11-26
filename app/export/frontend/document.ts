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

type SlotPath = ReadonlyArray<string | number | { id: string }>;

// Walk only declared slots. Ordinary arrays can contain records with type/props too.
export function mapSlots(
  props: Record<string, unknown>,
  fields: SlotFields,
  visit: (blocks: DocumentBlock[], address: string) => unknown
): Record<string, unknown> {
  function walk(
    props: Record<string, unknown>,
    fields: SlotFields,
    path: SlotPath,
    owned: boolean
  ): Record<string, unknown> {
    const result = { ...props };
    for (const [name, field] of Object.entries(fields)) {
      const present = Object.hasOwn(props, name);
      const value = present ? props[name] : undefined;
      const fieldPath = [...path, name];
      if (field === "slot") {
        if (owned || present) result[name] = visit(readBlocks(value ?? []), JSON.stringify(fieldPath));
      } else if (field.kind === "array" && Array.isArray(value)) {
        const ids = new Set<string>();
        result[name] = value.map((item, index) => {
          if (!isObject(item)) return item;
          const id = item.id;
          if (typeof id === "string" && id && !ids.has(id)) {
            ids.add(id);
            return walk(item, field.fields, [...fieldPath, { id }], false);
          }
          return walk(item, field.fields, [...fieldPath, index], false);
        });
      } else if (field.kind === "object" && isObject(value)) {
        result[name] = walk(value, field.fields, fieldPath, false);
      }
    }
    return result;
  }
  return walk(props, fields, [], true);
}
