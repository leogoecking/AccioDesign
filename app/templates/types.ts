import type { Data as AppData } from "~/puck";
import type { NavigationMode } from "~/puck/context/layout-mode-context";

export type TemplateId =
  | "sistema-administrativo"
  | "dashboard-operacional"
  | "central-atendimento"
  | "em-branco";

export type TemplatePreviewKind = "admin" | "dashboard" | "kanban" | "blank";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  previewKind: TemplatePreviewKind;
  defaultPresetId: string;
  defaultNavigationMode: NavigationMode;
  supportsNavigationModes: boolean;
}

export interface TemplateDefinition extends TemplateMeta {
  buildData: () => AppData;
}
