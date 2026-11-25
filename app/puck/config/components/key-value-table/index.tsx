import type { ComponentConfig } from "@puckeditor/core";
import {
  badgeVariantField,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { KeyValueTable, type KeyValueTableProps } from "./key-value-table";

export type { KeyValueTableProps };

export const conf: ComponentConfig<KeyValueTableProps> = {
  label: "Tabela Chave-Valor",
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
    keyHeader: {
      type: "text",
      label: "Cabeçalho da chave",
    },
    valueHeader: {
      type: "text",
      label: "Cabeçalho do valor",
    },
    rows: {
      type: "array",
      label: "Parâmetros",
      max: 15,
      getItemSummary: (item, index = 0) => item.label || `Item ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Chave" },
        value: { type: "text", label: "Valor" },
        badge: { type: "text", label: "Badge (opcional)" },
        badgeVariant: badgeVariantField,
      },
      defaultItemProps: {
        label: "Novo parâmetro",
        value: "Ativo",
        badge: "",
        badgeVariant: "secondary",
      },
    },
    padding,
  },
  defaultProps: {
    title: "Configurações do Ambiente",
    description: "Parâmetros técnicos ativos nesta instância.",
    keyHeader: "Parâmetro",
    valueHeader: "Configuração",
    rows: [
      {
        label: "Região principal",
        value: "sa-east-1",
        badge: "Primária",
        badgeVariant: "default",
      },
      {
        label: "Retenção de logs",
        value: "90 dias",
        badge: "",
        badgeVariant: "secondary",
      },
      {
        label: "Autenticação SSO",
        value: "SAML 2.0",
        badge: "Habilitado",
        badgeVariant: "secondary",
      },
      {
        label: "Limite de taxa (API)",
        value: "1.200 req/min",
        badge: "",
        badgeVariant: "outline",
      },
    ],
    padding: paddingDefaults,
  },
  render: KeyValueTable,
};

export default conf;
