import type { ComponentConfig } from "@puckeditor/core";
import { badgeVariantField, icon } from "~/puck/config/fields";
import { KpiCard, type KpiCardProps } from "./kpi-card";

export type { KpiCardProps };

export const conf: ComponentConfig<KpiCardProps> = {
  label: "Card KPI",
  fields: {
    title: {
      type: "text",
      label: "Título da métrica",
      contentEditable: true,
    },
    value: {
      type: "text",
      label: "Valor principal",
      contentEditable: true,
    },
    delta: {
      type: "text",
      label: "Variação",
    },
    trend: {
      type: "radio",
      label: "Tendência",
      options: [
        { label: "Alta", value: "up" },
        { label: "Queda", value: "down" },
        { label: "Estável", value: "neutral" },
      ],
    },
    helperText: {
      type: "text",
      label: "Texto auxiliar",
      contentEditable: true,
    },
    icon,
    badgeLabel: {
      type: "text",
      label: "Texto do badge (opcional)",
    },
    badgeVariant: badgeVariantField,
  },
  defaultProps: {
    title: "Ticket Médio",
    value: "R$ 1.240,00",
    delta: "+11,8%",
    trend: "up",
    helperText: "Comparado aos últimos 30 dias",
    icon: "dollar-sign",
    badgeLabel: "Meta atingida",
    badgeVariant: "secondary",
  },
  render: KpiCard,
};

export default conf;
