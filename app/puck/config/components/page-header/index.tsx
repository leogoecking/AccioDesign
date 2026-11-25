import type { ComponentConfig } from "@puckeditor/core";
import {
  badge,
  booleanRadio,
  buttons,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { PageHeader, type PageHeaderProps } from "./page-header";

export type { PageHeaderProps };

export const conf: ComponentConfig<PageHeaderProps> = {
  label: "Cabeçalho de Página",
  fields: {
    title: {
      type: "text",
      label: "Título",
      contentEditable: true,
    },
    subtitle: {
      type: "textarea",
      label: "Subtítulo",
      contentEditable: true,
    },
    badge,
    actions: buttons,
    showSeparator: booleanRadio("Exibir linha divisória"),
    padding,
  },
  defaultProps: {
    title: "Painel Operacional",
    subtitle:
      "Visão consolidada de indicadores, filas de atendimento e registros recentes.",
    badge: {
      label: "Atualizado",
      url: "",
      variant: "secondary",
    },
    actions: [
      {
        label: "Exportar CSV",
        url: "#exportar",
        variant: "outline",
        size: "default",
        icon: "download",
      },
      {
        label: "Novo registro",
        url: "#novo",
        variant: "default",
        size: "default",
        icon: "plus",
      },
    ],
    showSeparator: true,
    padding: paddingDefaults,
  },
  render: PageHeader,
};

export default conf;
