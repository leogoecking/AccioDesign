import type { ComponentConfig } from "@puckeditor/core";
import { padding, paddingDefaults } from "~/puck/config/fields";
import { TabsSection, type TabsSectionProps } from "./tabs-section";

export type { TabsSectionProps };

export const conf: ComponentConfig<TabsSectionProps> = {
  label: "Seção com Abas",
  fields: {
    variant: {
      type: "radio",
      label: "Estilo das abas",
      options: [
        { label: "Pílula", value: "default" },
        { label: "Linha", value: "line" },
      ],
    },
    tabs: {
      type: "array",
      label: "Abas",
      min: 1,
      max: 5,
      getItemSummary: (item, index = 0) => item.label || `Aba ${index + 1}`,
      arrayFields: {
        id: { type: "text", label: "Identificador único" },
        label: { type: "text", label: "Título da aba" },
        badge: { type: "text", label: "Contador/Badge" },
        content: {
          type: "slot",
          label: "Conteúdo da aba",
        },
      },
      defaultItemProps: (index) => ({
        id: `aba-${index + 1}`,
        label: `Aba ${index + 1}`,
        badge: "",
        content: [],
      }),
    },
    padding,
  },
  defaultProps: {
    variant: "default",
    tabs: [
      { id: "resumo", label: "Resumo", badge: "3", content: [] },
      { id: "auditoria", label: "Auditoria", badge: "", content: [] },
      { id: "config", label: "Configurações", badge: "", content: [] },
    ],
    padding: paddingDefaults,
  },
  render: TabsSection,
};

export default conf;
