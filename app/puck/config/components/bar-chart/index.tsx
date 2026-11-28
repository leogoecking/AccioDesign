import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  chartHeightField,
  chartValueFormatField,
  seriesConfigField,
} from "~/puck/config/fields/chart-fields";
import {
  BarChart,
  type BarChartDataPoint,
  type BarChartViewProps,
} from "./bar-chart";

export type BarChartProps = BarChartViewProps;

export const conf: ComponentConfig<BarChartProps> = {
  label: "Gráfico de Barras",
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
    orientation: {
      type: "radio",
      label: "Orientação das barras",
      options: [
        { label: "Verticais", value: "vertical" },
        { label: "Horizontais", value: "horizontal" },
      ],
    },
    stacked: booleanRadio("Empilhar barras"),
    barRadius: {
      type: "radio",
      label: "Arredondamento das barras",
      options: [
        { label: "Reto", value: "none" },
        { label: "Sutil", value: "sm" },
        { label: "Suave", value: "md" },
      ],
    },
    showGrid: booleanRadio("Exibir linhas de grade"),
    showXAxis: booleanRadio("Exibir eixo horizontal (X)"),
    showYAxis: booleanRadio("Exibir eixo vertical (Y)"),
    showLegend: booleanRadio("Exibir legenda"),
    primarySeries: seriesConfigField("Série principal"),
    showSecondarySeries: booleanRadio("Exibir segunda série"),
    secondarySeries: seriesConfigField("Segunda série"),
    data: {
      type: "array",
      label: "Categorias",
      max: 20,
      getItemSummary: (item: BarChartDataPoint, index = 0) =>
        item?.label ? `${item.label} (${item.primary ?? 0})` : `Item ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Categoria" },
        primary: { type: "number", label: "Valor principal" },
        secondary: { type: "number", label: "Segundo valor" },
      },
      defaultItemProps: {
        label: "Novo canal",
        primary: 120,
        secondary: 35,
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Atendimentos por Canal",
    description:
      "Comparativo de chamados concluídos versus pendências abertas na semana.",
    badgeLabel: "Semana atual",
    valueFormat: "number",
    unit: "",
    height: "md",
    orientation: "vertical",
    stacked: false,
    barRadius: "sm",
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
    primarySeries: { label: "Concluídos", color: "chart-1" },
    showSecondarySeries: true,
    secondarySeries: { label: "Pendentes", color: "chart-3" },
    data: [
      { label: "Chat", primary: 340, secondary: 42 },
      { label: "Portal", primary: 265, secondary: 38 },
      { label: "E-mail", primary: 210, secondary: 55 },
      { label: "Telefone", primary: 148, secondary: 19 },
      { label: "WhatsApp", primary: 295, secondary: 31 },
    ],
    emptyMessage: "Nenhuma categoria cadastrada para o gráfico de barras.",
    padding: paddingDefaults,
  },
  render: BarChart,
};

export default conf;
