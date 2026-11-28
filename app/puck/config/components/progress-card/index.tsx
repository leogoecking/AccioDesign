import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  ProgressCard,
  type ProgressCardViewProps,
  type ProgressGoalItem,
} from "./progress-card";

export type ProgressCardProps = ProgressCardViewProps;

export const conf: ComponentConfig<ProgressCardProps> = {
  label: "Card de Progresso",
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
      label: "Etiqueta (opcional)",
    },
    showPercentage: booleanRadio("Exibir percentual"),
    showValues: booleanRadio("Exibir valores atual e meta"),
    barSize: {
      type: "radio",
      label: "Espessura da barra",
      options: [
        { label: "Fina", value: "sm" },
        { label: "Padrão", value: "md" },
      ],
    },
    items: {
      type: "array",
      label: "Metas e progressos",
      max: 12,
      getItemSummary: (item: ProgressGoalItem, index = 0) =>
        item?.label || `Meta ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Título da meta" },
        helperText: { type: "text", label: "Texto auxiliar" },
        current: { type: "number", label: "Valor atual", min: 0 },
        target: { type: "number", label: "Meta / Máximo", min: 0 },
        format: {
          type: "select",
          label: "Formato",
          options: [
            { label: "Número", value: "number" },
            { label: "Moeda (R$)", value: "currency" },
            { label: "Percentual (%)", value: "percent" },
          ],
        },
        unit: { type: "text", label: "Unidade (opcional)" },
        tone: {
          type: "select",
          label: "Cor da barra",
          options: [
            { label: "Primária", value: "primary" },
            { label: "Série 1 (chart-1)", value: "chart-1" },
            { label: "Série 2 (chart-2)", value: "chart-2" },
            { label: "Série 3 (chart-3)", value: "chart-3" },
            { label: "Série 4 (chart-4)", value: "chart-4" },
            { label: "Alerta (destructive)", value: "destructive" },
          ],
        },
      },
      defaultItemProps: {
        label: "Nova meta operacional",
        helperText: "Referência do mês atual",
        current: 65,
        target: 100,
        format: "number",
        unit: "itens",
        tone: "primary",
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Metas do Trimestre",
    description:
      "Acompanhamento de receita contratada, implantação de clientes e capacidade de suporte.",
    badgeLabel: "Q4 2026",
    showPercentage: true,
    showValues: true,
    barSize: "md",
    items: [
      {
        label: "Receita nova anual (ARR)",
        helperText: "Meta comercial consolidada das regionais",
        current: 420000,
        target: 500000,
        format: "currency",
        unit: "",
        tone: "chart-1",
      },
      {
        label: "Contas em produção",
        helperText: "Empresas que concluíram a etapa de implantação",
        current: 38,
        target: 45,
        format: "number",
        unit: "contas",
        tone: "chart-2",
      },
      {
        label: "Cumprimento de SLA N1",
        helperText: "Chamados respondidos dentro do prazo acordado",
        current: 96,
        target: 98,
        format: "percent",
        unit: "",
        tone: "primary",
      },
      {
        label: "Pendências críticas abertas",
        helperText: "Limite máximo aceito para o turno vigente",
        current: 3,
        target: 10,
        format: "number",
        unit: "incidentes",
        tone: "chart-3",
      },
    ],
    emptyMessage: "Nenhuma meta configurada no momento.",
    padding: paddingDefaults,
  },
  render: ProgressCard,
};

export default conf;
