import type { ComponentConfig } from "@puckeditor/core";
import {
  badgeVariantField,
  icon,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  StatusBadgeGroup,
  type StatusBadgeGroupProps,
} from "./status-badge-group";

export type { StatusBadgeGroupProps };

export const conf: ComponentConfig<StatusBadgeGroupProps> = {
  label: "Indicadores de Status",
  fields: {
    title: {
      type: "text",
      label: "Título do grupo",
      contentEditable: true,
    },
    items: {
      type: "array",
      label: "Badges",
      max: 8,
      getItemSummary: (item, index = 0) => item.label || `Status ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        value: { type: "text", label: "Valor" },
        tooltip: { type: "text", label: "Tooltip explicativo" },
        variant: badgeVariantField,
        icon,
      },
      defaultItemProps: {
        label: "Serviço",
        value: "OK",
        tooltip: "Operando normalmente",
        variant: "secondary",
        icon: "check-circle-2",
      },
    },
    padding,
  },
  defaultProps: {
    title: "Saúde dos Serviços",
    items: [
      {
        label: "API Core",
        value: "99,98%",
        tooltip: "Latência média de 42ms",
        variant: "default",
        icon: "check-circle-2",
      },
      {
        label: "Filas Async",
        value: "14 pendentes",
        tooltip: "Processamento dentro do limite",
        variant: "secondary",
        icon: "clock",
      },
      {
        label: "Gateway Pagamento",
        value: "Estável",
        tooltip: "Sem falhas nas últimas 6h",
        variant: "outline",
        icon: "shield",
      },
      {
        label: "Webhook CRM",
        value: "Atenção",
        tooltip: "2 tentativas em reprocessamento",
        variant: "destructive",
        icon: "alert-circle",
      },
    ],
    padding: paddingDefaults,
  },
  render: StatusBadgeGroup,
};

export default conf;
