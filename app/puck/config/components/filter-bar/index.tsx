import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  button,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { FilterBar, type FilterBarProps } from "./filter-bar";

export type { FilterBarProps };

export const conf: ComponentConfig<FilterBarProps> = {
  label: "Barra de Filtros",
  fields: {
    searchPlaceholder: {
      type: "text",
      label: "Placeholder da busca",
    },
    filters: {
      type: "array",
      label: "Chips de filtro",
      max: 6,
      getItemSummary: (item, index = 0) => item.label || `Filtro ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        active: booleanRadio("Ativo por padrão"),
      },
      defaultItemProps: {
        label: "Filtro",
        active: false,
      },
    },
    secondaryAction: {
      ...button,
      label: "Ação secundária",
    },
    primaryAction: {
      ...button,
      label: "Ação primária",
    },
    padding,
  },
  defaultProps: {
    searchPlaceholder: "Buscar por nome, ID ou responsável...",
    filters: [
      { label: "Todos", active: true },
      { label: "Aprovados", active: false },
      { label: "Em análise", active: false },
      { label: "Críticos", active: false },
    ],
    secondaryAction: {
      label: "Filtros avançados",
      url: "",
      variant: "outline",
      size: "sm",
      icon: "filter",
    },
    primaryAction: {
      label: "Aplicar",
      url: "",
      variant: "default",
      size: "sm",
      icon: "check",
    },
    padding: paddingDefaults,
  },
  render: FilterBar,
};

export default conf;
