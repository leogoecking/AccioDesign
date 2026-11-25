import type { ComponentConfig } from "@puckeditor/core";
import {
  cards,
  contentFields,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { CardGrid, type CardGridProps } from "./card-grid";

export type { CardGridProps };

export const conf: ComponentConfig<CardGridProps> = {
  label: "Grade de Cards",
  fields: {
    ...contentFields,
    columns: {
      type: "radio",
      label: "Colunas (desktop)",
      options: [
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
      ],
    },
    cards: {
      ...cards,
      min: 1,
      max: 8,
    },
    padding,
  },
  defaultProps: {
    heading: "Módulos do Painel",
    description:
      "Atalhos administrativos para os principais fluxos da operação.",
    badge: {
      label: "Catálogo",
      url: "",
      variant: "secondary",
    },
    buttons: [],
    columns: "3",
    cards: [
      {
        ...cards.defaultItemProps,
        icon: "users",
        heading: "Gestão de Equipes",
        description: "Convide colaboradores e gerencie papéis de acesso.",
      },
      {
        ...cards.defaultItemProps,
        icon: "credit-card",
        heading: "Faturamento",
        description: "Acompanhe faturas, repasses e conciliação bancária.",
      },
      {
        ...cards.defaultItemProps,
        icon: "shield",
        heading: "Auditoria",
        description: "Histórico completo de eventos e alterações críticas.",
      },
    ],
    padding: paddingDefaults,
  },
  render: CardGrid,
};

export default conf;
