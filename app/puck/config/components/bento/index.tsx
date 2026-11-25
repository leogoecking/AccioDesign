import type { ComponentConfig } from "@puckeditor/core";
import {
  cards,
  contentFields,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { Bento, type BentoProps } from "./bento";

export type { BentoProps };

export const conf: ComponentConfig<BentoProps> = {
  label: "Grade Bento",
  fields: {
    ...contentFields,
    cards: {
      ...cards,
      min: 1,
      max: 4,
    },
    padding,
  },
  defaultProps: {
    badge: {
      label: "Módulos",
      url: "",
      variant: "secondary",
    },
    heading: "Arquitetura de módulos administrativos",
    description:
      "Organize visões prioritárias em blocos assimétricos para leitura rápida.",
    buttons: [],
    cards: [
      {
        ...cards.defaultItemProps,
        icon: "layout-dashboard",
        heading: "Central de Operações",
        description: "Consolide filas críticas e alertas em tempo real.",
      },
      {
        ...cards.defaultItemProps,
        icon: "shield",
        heading: "Controle de Acessos",
        description: "Perfis e permissões por equipe.",
      },
      {
        ...cards.defaultItemProps,
        icon: "database",
        heading: "Integrações",
        description: "Webhooks e sincronizações ativas.",
      },
      {
        ...cards.defaultItemProps,
        icon: "bar-chart-3",
        heading: "Relatórios Executivos",
        description: "Exportações agendadas e métricas históricas.",
      },
    ],
    padding: paddingDefaults,
  },
  render: Bento,
};

export default conf;
