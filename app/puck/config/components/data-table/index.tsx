import type { ComponentConfig } from "@puckeditor/core";
import {
  badgeVariantField,
  booleanRadio,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { DataTable, type DataTableProps } from "./data-table";

export type { DataTableProps };

export const conf: ComponentConfig<DataTableProps> = {
  label: "Tabela de Dados",
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
    caption: {
      type: "text",
      label: "Legenda (rodapé da tabela)",
    },
    showSearch: booleanRadio("Exibir busca"),
    searchPlaceholder: {
      type: "text",
      label: "Placeholder da busca",
    },
    headers: {
      type: "object",
      label: "Cabeçalhos das colunas",
      objectFields: {
        col1: { type: "text", label: "Coluna 1" },
        col2: { type: "text", label: "Coluna 2" },
        col3: { type: "text", label: "Coluna 3" },
        col4: { type: "text", label: "Coluna 4" },
        status: { type: "text", label: "Coluna Status" },
      },
    },
    showColumn3: booleanRadio("Mostrar Coluna 3"),
    showColumn4: booleanRadio("Mostrar Coluna 4"),
    showStatus: booleanRadio("Mostrar Coluna Status"),
    rows: {
      type: "array",
      label: "Linhas",
      max: 20,
      getItemSummary: (item, index = 0) => item.col1 || `Linha ${index + 1}`,
      arrayFields: {
        col1: { type: "text", label: "Coluna 1" },
        col2: { type: "text", label: "Coluna 2" },
        col3: { type: "text", label: "Coluna 3" },
        col4: { type: "text", label: "Coluna 4" },
        status: { type: "text", label: "Status" },
        statusVariant: badgeVariantField,
      },
      defaultItemProps: {
        col1: "OP-1046",
        col2: "Nova Conta Enterprise",
        col3: "R$ 4.800,00",
        col4: "Hoje, 14:20",
        status: "Pendente",
        statusVariant: "secondary",
      },
    },
    padding,
  },
  defaultProps: {
    title: "Movimentações Operacionais",
    description: "Últimas ordens e faturas processadas pelo motor financeiro.",
    caption: "Exibindo os registros mais recentes da competência atual.",
    showSearch: true,
    searchPlaceholder: "Buscar por código, cliente ou status...",
    headers: {
      col1: "Código",
      col2: "Cliente / Organização",
      col3: "Valor",
      col4: "Atualização",
      status: "Situação",
    },
    showColumn3: true,
    showColumn4: true,
    showStatus: true,
    rows: [
      {
        col1: "OP-1042",
        col2: "Grupo Horizonte Ltda",
        col3: "R$ 18.400,00",
        col4: "Há 12 min",
        status: "Aprovado",
        statusVariant: "default",
      },
      {
        col1: "OP-1043",
        col2: "Vértice Logística S.A.",
        col3: "R$ 9.250,00",
        col4: "Há 38 min",
        status: "Em análise",
        statusVariant: "secondary",
      },
      {
        col1: "OP-1044",
        col2: "Clínica São Lucas",
        col3: "R$ 3.120,00",
        col4: "Há 2 horas",
        status: "Aprovado",
        statusVariant: "default",
      },
      {
        col1: "OP-1045",
        col2: "Atacado Central ME",
        col3: "R$ 6.780,00",
        col4: "Ontem",
        status: "Divergência",
        statusVariant: "destructive",
      },
    ],
    padding: paddingDefaults,
  },
  render: DataTable,
};

export default conf;
