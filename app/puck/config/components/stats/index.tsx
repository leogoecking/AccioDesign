import type { ComponentConfig } from "@puckeditor/core";
import {
  contentFields,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { Stats, type StatsProps } from "./stats";

export type { StatsProps };

export const conf: ComponentConfig<StatsProps> = {
  label: "Faixa de Estatísticas",
  fields: {
    layout: {
      type: "radio",
      label: "Layout",
      options: [
        { label: "Linha (4 colunas)", value: "inline" },
        { label: "Seção com texto", value: "section" },
      ],
    },
    ...contentFields,
    statistics: {
      type: "array",
      label: "Indicadores",
      max: 8,
      getItemSummary: (item: StatsProps["statistics"][number], index = 0) =>
        item.label || `Indicador ${index + 1}`,
      arrayFields: {
        value: {
          type: "text",
          label: "Valor",
          contentEditable: true,
        },
        label: {
          type: "text",
          label: "Rótulo",
          contentEditable: true,
        },
        percentage: {
          type: "number",
          label: "Variação (%)",
          min: 0,
          max: 99999,
        },
        direction: {
          type: "radio",
          label: "Direção",
          options: [
            { label: "Nenhuma", value: "none" },
            { label: "Alta", value: "increase" },
            { label: "Queda", value: "decrease" },
          ],
        },
        polarity: {
          type: "radio",
          label: "Impacto",
          options: [
            { label: "Neutro", value: "none" },
            { label: "Positivo", value: "positive" },
            { label: "Negativo", value: "negative" },
          ],
        },
      },
      defaultItemProps: {
        label: "Novo indicador",
        value: "100",
        percentage: 5,
        direction: "increase",
        polarity: "positive",
      },
    },
    padding,
  },
  defaultProps: {
    layout: "inline",
    heading: "Indicadores-chave do período",
    description:
      "Acompanhamento consolidado de receita, usuários ativos, conversão e SLA.",
    badge: {
      label: "Telemetria",
      url: "",
      variant: "secondary",
    },
    buttons: [
      {
        label: "Ver relatório completo",
        url: "#relatorios",
        icon: "move-right",
        variant: "secondary",
        size: "default",
      },
    ],
    statistics: [
      {
        label: "Receita Mensal (MRR)",
        value: "R$ 482.900",
        percentage: 14.2,
        direction: "increase",
        polarity: "positive",
      },
      {
        label: "Usuários Ativos",
        value: "12.480",
        percentage: 8.4,
        direction: "increase",
        polarity: "positive",
      },
      {
        label: "Taxa de Conversão",
        value: "4,85%",
        percentage: 0.6,
        direction: "increase",
        polarity: "positive",
      },
      {
        label: "SLA de Atendimento",
        value: "99,4%",
        percentage: 0.3,
        direction: "decrease",
        polarity: "negative",
      },
    ],
    padding: paddingDefaults,
  },
  resolveFields: (data, params) => {
    if (data.props.layout === "inline") {
      const { heading, description, buttons, badge, ...newFields } =
        params.fields;
      return newFields;
    }

    return params.fields;
  },
  render: Stats,
};

export default conf;
