import type { ComponentConfig } from "@puckeditor/core";
import { badge, button, icon } from "~/puck/config/fields";
import { DashboardCard, type DashboardCardProps } from "./dashboard-card";

export type { DashboardCardProps };

export const conf: ComponentConfig<DashboardCardProps> = {
  label: "Card Administrativo",
  fields: {
    title: {
      type: "text",
      label: "Título",
      contentEditable: true,
    },
    description: {
      type: "textarea",
      label: "Descrição",
      contentEditable: true,
    },
    icon,
    badge,
    size: {
      type: "radio",
      label: "Densidade",
      options: [
        { label: "Padrão", value: "default" },
        { label: "Compacto", value: "sm" },
      ],
    },
    bodyText: {
      type: "textarea",
      label: "Texto de apoio",
      contentEditable: true,
    },
    content: {
      type: "slot",
      label: "Conteúdo interno (opcional)",
    },
    footerButton: {
      ...button,
      label: "Botão no rodapé",
    },
  },
  defaultProps: {
    title: "Resumo de Operações",
    description: "Status consolidado das filas e integrações ativas.",
    icon: "layers",
    badge: {
      label: "Estável",
      url: "",
      variant: "secondary",
    },
    size: "default",
    bodyText:
      "Todos os serviços de processamento assíncrono responderam dentro do SLA esperado nas últimas 24 horas.",
    content: [],
    footerButton: {
      label: "Ver detalhes",
      url: "#detalhes",
      variant: "outline",
      size: "sm",
      icon: "arrow-right",
    },
  },
  render: DashboardCard,
};

export default conf;
