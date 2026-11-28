import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  chartColorTokenField,
  chartHeightField,
  chartValueFormatField,
} from "~/puck/config/fields/chart-fields";
import {
  DonutChart,
  type DonutChartSegment,
  type DonutChartViewProps,
} from "./donut-chart";

export type DonutChartProps = DonutChartViewProps;

export const conf: ComponentConfig<DonutChartProps> = {
  label: "Gráfico de Distribuição",
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
    badgeLabel: {
      type: "text",
      label: "Etiqueta / Período (opcional)",
    },
    valueFormat: chartValueFormatField,
    unit: {
      type: "text",
      label: "Sufixo / Unidade (opcional)",
    },
    height: chartHeightField,
    variant: {
      type: "radio",
      label: "Estilo visual",
      options: [
        { label: "Rosca (Donut)", value: "donut" },
        { label: "Pizza (Cheio)", value: "pie" },
      ],
    },
    showCenterTotal: booleanRadio("Exibir total central (modo Rosca)"),
    centerLabel: {
      type: "text",
      label: "Rótulo central",
    },
    showLegend: booleanRadio("Exibir legenda detalhada"),
    data: {
      type: "array",
      label: "Fatias",
      max: 10,
      getItemSummary: (item: DonutChartSegment, index = 0) =>
        item?.label ? `${item.label} (${item.value ?? 0})` : `Fatia ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Categoria" },
        value: { type: "number", label: "Valor", min: 0 },
        color: chartColorTokenField,
      },
      defaultItemProps: {
        label: "Nova categoria",
        value: 80,
        color: "chart-5",
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Distribuição por Categoria",
    description:
      "Participação dos principais tipos de demanda no volume total de atendimentos.",
    badgeLabel: "Mês vigente",
    valueFormat: "number",
    unit: "chamados",
    height: "md",
    variant: "donut",
    showCenterTotal: true,
    centerLabel: "Total no mês",
    showLegend: true,
    data: [
      { label: "Suporte N1", value: 420, color: "chart-1" },
      { label: "Financeiro", value: 285, color: "chart-2" },
      { label: "Integrações", value: 195, color: "chart-3" },
      { label: "Acessos e Perfis", value: 140, color: "chart-4" },
    ],
    emptyMessage: "Nenhuma categoria disponível para distribuição.",
    padding: paddingDefaults,
  },
  render: DonutChart,
};

export default conf;
