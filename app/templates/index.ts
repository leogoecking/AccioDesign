import type { Data as AppData } from "~/puck";
import type { RootProps } from "~/puck/components/root";

let fallbackIdCounter = 0;
function createShortId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }
  fallbackIdCounter += 1;
  return `${Date.now().toString(36)}-${fallbackIdCounter}`;
}
import { normalizeThemeDocument } from "~/theme/schema";
import { centralAtendimentoTemplate } from "./central-atendimento";
import { dashboardOperacionalTemplate } from "./dashboard-operacional";
import { emBrancoTemplate } from "./em-branco";
import { sistemaAdministrativoTemplate } from "./sistema-administrativo";
import type { TemplateDefinition, TemplateId, TemplateMeta } from "./types";

export type { TemplateDefinition, TemplateId, TemplateMeta, TemplatePreviewKind } from "./types";

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  "sistema-administrativo": sistemaAdministrativoTemplate,
  "dashboard-operacional": dashboardOperacionalTemplate,
  "central-atendimento": centralAtendimentoTemplate,
  "em-branco": emBrancoTemplate,
};

function toMeta(def: TemplateDefinition): TemplateMeta {
  const { buildData: _buildData, ...meta } = def;
  return meta;
}

export const GALLERY_TEMPLATES_META: TemplateMeta[] = [
  toMeta(sistemaAdministrativoTemplate),
  toMeta(dashboardOperacionalTemplate),
  toMeta(centralAtendimentoTemplate),
];

export const ALL_TEMPLATES_META: TemplateMeta[] = [
  ...GALLERY_TEMPLATES_META,
  toMeta(emBrancoTemplate),
];

export function isTemplateId(value: string): value is TemplateId {
  return value in TEMPLATE_REGISTRY;
}

export function getTemplateDefinition(templateId: string): TemplateDefinition {
  if (isTemplateId(templateId)) {
    return TEMPLATE_REGISTRY[templateId];
  }
  return sistemaAdministrativoTemplate;
}

function regenerateSlotItems(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => regenerateComponentNode(item));
  }
  return value;
}

function isPuckBlockNode(
  value: unknown
): value is { type: string; props?: Record<string, unknown> } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

function regenerateComponentNode(node: unknown): unknown {
  if (!isPuckBlockNode(node)) {
    return node;
  }

  const nextProps: Record<string, unknown> = {};
  if (node.props && typeof node.props === "object") {
    for (const [key, propValue] of Object.entries(node.props)) {
      if (Array.isArray(propValue) && propValue.some((entry) => isPuckBlockNode(entry))) {
        nextProps[key] = regenerateSlotItems(propValue);
      } else {
        nextProps[key] = propValue;
      }
    }
  }

  nextProps.id = `${node.type}-${createShortId()}`;

  return {
    ...node,
    props: nextProps,
  };
}

export function cloneAndRefreshDocumentIds(data: AppData): AppData {
  const cloned = structuredClone(data) as AppData;
  const content = Array.isArray(cloned.content)
    ? (cloned.content.map((item) => regenerateComponentNode(item)) as AppData["content"])
    : [];

  const zones: AppData["zones"] = {};
  if (cloned.zones && typeof cloned.zones === "object") {
    for (const [zoneKey, zoneItems] of Object.entries(cloned.zones)) {
      zones[zoneKey] = Array.isArray(zoneItems)
        ? (zoneItems.map((item) => regenerateComponentNode(item)) as typeof zoneItems)
        : [];
    }
  }

  const rawRootProps = (cloned.root?.props ?? {}) as Partial<RootProps>;
  const rootProps = {
    ...rawRootProps,
    title:
      typeof rawRootProps.title === "string" && rawRootProps.title.trim()
        ? rawRootProps.title
        : "AccioDesign",
    theme: normalizeThemeDocument(rawRootProps.theme),
  };

  return {
    ...cloned,
    root: {
      ...(cloned.root ?? {}),
      props: rootProps,
    },
    content,
    zones,
  };
}

export function instantiateTemplate(
  templateId: string,
  customTitle?: string
): AppData {
  const def = getTemplateDefinition(templateId);
  const fresh = cloneAndRefreshDocumentIds(def.buildData());
  return {
    ...fresh,
    root: {
      ...fresh.root,
      props: {
        ...fresh.root?.props,
        title: customTitle?.trim() || fresh.root?.props?.title || def.name,
        layoutWidth: { mode: "fluid" },
      },
    },
  };
}
