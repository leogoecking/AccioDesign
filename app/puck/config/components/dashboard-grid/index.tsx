import type { ComponentConfig, Slot } from "@puckeditor/core";
import { padding, paddingDefaults } from "~/puck/config/fields";
import { DashboardGrid, type DashboardGridViewProps } from "./dashboard-grid";

export type DashboardGridProps = Omit<DashboardGridViewProps, "items"> & { items: Slot };

export const conf: ComponentConfig<DashboardGridProps> = {
  label: "Grade de Dashboard",
  fields: {
    sectionTitle: {
      type: "text",
      label: "Título da seção",
      contentEditable: true,
    },
    sectionDescription: {
      type: "textarea",
      label: "Descrição da seção",
      contentEditable: true,
    },
    columns: {
      type: "radio",
      label: "Colunas (desktop)",
      options: [
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
      ],
    },
    gap: {
      type: "radio",
      label: "Espaçamento",
      options: [
        { label: "Compacto", value: "sm" },
        { label: "Médio", value: "md" },
        { label: "Amplo", value: "lg" },
      ],
    },
    items: {
      type: "slot",
      label: "Componentes na grade",
    },
    padding,
  },
  defaultProps: {
    sectionTitle: "Blocos do Painel",
    sectionDescription: "Arraste cards, indicadores ou tabelas para dentro da grade.",
    columns: "2",
    gap: "md",
    items: [],
    padding: paddingDefaults,
  },
  render: DashboardGrid,
};

export default conf;
