import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  chartCurveField,
  chartHeightField,
  chartValueFormatField,
  seriesConfigField,
} from "~/puck/config/fields/chart-fields";
import {
  LineChart,
  type LineChartDataPoint,
  type LineChartViewProps,
} from "./line-chart";

export type LineChartProps = LineChartViewProps;

export const conf: ComponentConfig<LineChartProps> = {
  label: "Gráfico de Linhas",
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
    curveType: chartCurveField,
    showDots: booleanRadio("Exibir marcadores nos pontos"),
    dashedSecondary: booleanRadio("Tracejar segunda série (meta)"),
    showGrid: booleanRadio("Exibir linhas de grade"),
    showXAxis: booleanRadio("Exibir eixo horizontal (X)"),
    showYAxis: booleanRadio("Exibir eixo vertical (Y)"),
    showLegend: booleanRadio("Exibir legenda"),
    primarySeries: seriesConfigField("Série principal"),
    showSecondarySeries: booleanRadio("Exibir segunda série"),
    secondarySeries: seriesConfigField("Segunda série"),
    data: {
      type: "array",
      label: "Pontos de dados",
      max: 24,
      getItemSummary: (item: LineChartDataPoint, index = 0) =>
        item?.label ? `${item.label} (${item.primary ?? 0})` : `Ponto ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        primary: { type: "number", label: "Valor principal" },
        secondary: { type: "number", label: "Segundo valor" },
      },
      defaultItemProps: {
        label: "Sem 7",
        primary: 5.2,
        secondary: 5.0,
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Taxa de Conversão vs. Meta",
    description:
      "Desempenho semanal do funil de ativação comparado ao objetivo planejado.",
    badgeLabel: "Trimestre atual",
    valueFormat: "percent",
    unit: "",
    height: "md",
    curveType: "monotone",
    showDots: true,
    dashedSecondary: true,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
    primarySeries: { label: "Conversão real", color: "chart-1" },
    showSecondarySeries: true,
    secondarySeries: { label: "Meta definida", color: "chart-4" },
    data: [
      { label: "Sem 1", primary: 3.8, secondary: 4.2 },
      { label: "Sem 2", primary: 4.1, secondary: 4.2 },
      { label: "Sem 3", primary: 4.5, secondary: 4.5 },
      { label: "Sem 4", primary: 4.3, secondary: 4.5 },
      { label: "Sem 5", primary: 4.9, secondary: 4.8 },
      { label: "Sem 6", primary: 5.4, secondary: 4.8 },
    ],
    emptyMessage: "Nenhum registro semanal disponível para o gráfico de linhas.",
    padding: paddingDefaults,
  },
  render: LineChart,
};

export default conf;
