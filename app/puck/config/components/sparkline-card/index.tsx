import type { ComponentConfig } from "@puckeditor/core";
import { badgeVariantField, booleanRadio, icon } from "~/puck/config/fields";
import {
  chartColorTokenField,
  chartHeightField,
  chartValueFormatField,
} from "~/puck/config/fields/chart-fields";
import {
  SparklineCard,
  type SparklineCardViewProps,
  type SparklinePoint,
} from "./sparkline-card";

export type SparklineCardProps = SparklineCardViewProps;

export const conf: ComponentConfig<SparklineCardProps> = {
  label: "Card com Tendência",
  fields: {
    title: {
      type: "text",
      label: "Título do indicador",
      contentEditable: true,
    },
    value: {
      type: "text",
      label: "Valor em destaque",
      contentEditable: true,
    },
    delta: {
      type: "text",
      label: "Variação",
    },
    trend: {
      type: "radio",
      label: "Direção",
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
    badgeLabel: {
      type: "text",
      label: "Texto do badge (opcional)",
    },
    badgeVariant: badgeVariantField,
    icon,
    chartType: {
      type: "radio",
      label: "Tipo do mini gráfico",
      options: [
        { label: "Área", value: "area" },
        { label: "Linha", value: "line" },
        { label: "Barras", value: "bar" },
      ],
    },
    color: chartColorTokenField,
    height: chartHeightField,
    valueFormat: chartValueFormatField,
    unit: {
      type: "text",
      label: "Sufixo / Unidade (opcional)",
    },
    showTooltip: booleanRadio("Exibir tooltip ao passar o mouse"),
    data: {
      type: "array",
      label: "Série histórica",
      max: 24,
      getItemSummary: (item: SparklinePoint, index = 0) =>
        item?.label ? `${item.label} (${item.value ?? 0})` : `Ponto ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Período" },
        value: { type: "number", label: "Valor" },
      },
      defaultItemProps: {
        label: "Sem 8",
        value: 495000,
      },
    },
  },
  defaultProps: {
    title: "Receita Mensal (MRR)",
    value: "R$ 482.900",
    delta: "+14,2%",
    trend: "up",
    helperText: "Tendência das últimas 7 semanas",
    badgeLabel: "Em alta",
    badgeVariant: "secondary",
    icon: "trending-up",
    chartType: "area",
    color: "chart-1",
    height: "md",
    valueFormat: "currency",
    unit: "",
    showTooltip: true,
    data: [
      { label: "Sem 1", value: 392000 },
      { label: "Sem 2", value: 408500 },
      { label: "Sem 3", value: 419000 },
      { label: "Sem 4", value: 435200 },
      { label: "Sem 5", value: 448900 },
      { label: "Sem 6", value: 467400 },
      { label: "Sem 7", value: 482900 },
    ],
  },
  render: SparklineCard,
};

export default conf;
