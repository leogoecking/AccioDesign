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
  AreaChart,
  type AreaChartDataPoint,
  type AreaChartViewProps,
} from "./area-chart";

export type AreaChartProps = AreaChartViewProps;

export const conf: ComponentConfig<AreaChartProps> = {
  label: "Gráfico de Área",
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
    fillStyle: {
      type: "radio",
      label: "Preenchimento",
      options: [
        { label: "Degradê", value: "gradient" },
        { label: "Sólido sutil", value: "solid" },
      ],
    },
    stacked: booleanRadio("Empilhar séries"),
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
      getItemSummary: (item: AreaChartDataPoint, index = 0) =>
        item?.label ? `${item.label} (${item.primary ?? 0})` : `Ponto ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        primary: { type: "number", label: "Valor principal" },
        secondary: { type: "number", label: "Segundo valor" },
      },
      defaultItemProps: {
        label: "Jul",
        primary: 92000,
        secondary: 54000,
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Receita Recorrente e Custos",
    description:
      "Evolução mensal do faturamento bruto em comparação com custos operacionais.",
    badgeLabel: "Últimos 6 meses",
    valueFormat: "currency",
    unit: "",
    height: "md",
    curveType: "monotone",
    fillStyle: "gradient",
    stacked: false,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
    primarySeries: { label: "Receita", color: "chart-1" },
    showSecondarySeries: true,
    secondarySeries: { label: "Custos", color: "chart-2" },
    data: [
      { label: "Jan", primary: 68400, secondary: 41200 },
      { label: "Fev", primary: 73900, secondary: 43800 },
      { label: "Mar", primary: 81200, secondary: 46500 },
      { label: "Abr", primary: 79400, secondary: 45100 },
      { label: "Mai", primary: 91600, secondary: 48900 },
      { label: "Jun", primary: 98500, secondary: 51300 },
    ],
    emptyMessage: "Nenhum período registrado para o gráfico de área.",
    padding: paddingDefaults,
  },
  render: AreaChart,
};

export default conf;
