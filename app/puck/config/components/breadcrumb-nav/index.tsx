import type { ComponentConfig } from "@puckeditor/core";
import {
  badge,
  button,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { BreadcrumbNav, type BreadcrumbNavProps } from "./breadcrumb-nav";

export type { BreadcrumbNavProps };

export const conf: ComponentConfig<BreadcrumbNavProps> = {
  label: "Trilha de Navegação",
  fields: {
    items: {
      type: "array",
      label: "Níveis anteriores",
      max: 5,
      getItemSummary: (item, index = 0) => item.label || `Nível ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        url: { type: "text", label: "URL" },
      },
      defaultItemProps: {
        label: "Início",
        url: "/",
      },
    },
    currentPage: {
      type: "text",
      label: "Página atual",
      contentEditable: true,
    },
    badge,
    action: button,
    padding,
  },
  defaultProps: {
    items: [
      { label: "Console", url: "/" },
      { label: "Operações", url: "#operacoes" },
    ],
    currentPage: "Monitoramento em tempo real",
    badge: {
      label: "Produção",
      url: "",
      variant: "secondary",
    },
    action: {
      label: "Atualizar",
      url: "",
      variant: "outline",
      size: "sm",
      icon: "activity",
    },
    padding: paddingDefaults,
  },
  render: BreadcrumbNav,
};

export default conf;
