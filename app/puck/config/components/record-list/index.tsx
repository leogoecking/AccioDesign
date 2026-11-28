import type { ComponentConfig } from "@puckeditor/core";
import {
  badgeVariantField,
  booleanRadio,
  button,
  icon,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  RecordList,
  type RecordListItem,
  type RecordListViewProps,
} from "./record-list";

export type RecordListProps = RecordListViewProps;

export const conf: ComponentConfig<RecordListProps> = {
  label: "Lista de Registros",
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
    variant: {
      type: "radio",
      label: "Densidade da lista",
      options: [
        { label: "Convencional", value: "default" },
        { label: "Compacta", value: "compact" },
      ],
    },
    mediaType: {
      type: "radio",
      label: "Identificador visual",
      options: [
        { label: "Avatar", value: "avatar" },
        { label: "Ícone", value: "icon" },
      ],
    },
    showCopyCode: booleanRadio("Permitir copiar código"),
    items: {
      type: "array",
      label: "Registros",
      max: 20,
      getItemSummary: (item: RecordListItem, index = 0) =>
        item?.title || `Registro ${index + 1}`,
      arrayFields: {
        title: { type: "text", label: "Título" },
        description: { type: "text", label: "Descrição" },
        code: { type: "text", label: "Código / Referência" },
        value: { type: "text", label: "Valor (opcional)" },
        date: { type: "text", label: "Data (opcional)" },
        status: { type: "text", label: "Status (opcional)" },
        statusVariant: badgeVariantField,
        avatarName: { type: "text", label: "Nome para avatar" },
        avatarUrl: { type: "text", label: "URL da foto (opcional)" },
        icon,
        actionLabel: { type: "text", label: "Rótulo da ação" },
        actionUrl: { type: "text", label: "URL da ação" },
      },
      defaultItemProps: {
        title: "Novo Cliente Corporativo",
        description: "Plano Corporativo · São Paulo, SP",
        code: "CLI-2090",
        value: "R$ 3.400,00",
        date: "Hoje",
        status: "Ativo",
        statusVariant: "secondary",
        avatarName: "Novo Cliente",
        icon: "building-2",
        actionLabel: "Abrir",
        actionUrl: "#abrir",
      },
    },
    footerAction: {
      ...button,
      label: "Botão de rodapé (opcional)",
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Contas e Faturas Recentes",
    description:
      "Principais organizações com movimentação financeira ou renovação nesta competência.",
    badgeLabel: "4 registros",
    variant: "default",
    mediaType: "avatar",
    showCopyCode: true,
    items: [
      {
        title: "Horizonte Logística Ltda",
        description: "Contrato Enterprise · Gestão de Frota",
        code: "CTR-1042",
        value: "R$ 18.400,00",
        date: "28 nov",
        status: "Aprovado",
        statusVariant: "default",
        avatarName: "Horizonte Logística",
        icon: "building-2",
        actionLabel: "Detalhes",
        actionUrl: "#ctr-1042",
      },
      {
        title: "Clínica Vida Integrada",
        description: "Assinatura Corporativa · Unidade Centro",
        code: "CTR-1048",
        value: "R$ 6.250,00",
        date: "27 nov",
        status: "Em análise",
        statusVariant: "secondary",
        avatarName: "Clínica Vida",
        icon: "users",
        actionLabel: "Revisar",
        actionUrl: "#ctr-1048",
      },
      {
        title: "Vértice Engenharia S.A.",
        description: "Renovação anual · Faturamento recorrente",
        code: "CTR-1051",
        value: "R$ 9.800,00",
        date: "26 nov",
        status: "Pendente",
        statusVariant: "outline",
        avatarName: "Vértice Engenharia",
        icon: "file-text",
        actionLabel: "Cobrar",
        actionUrl: "#ctr-1051",
      },
      {
        title: "Atacado Central ME",
        description: "Divergência na retenção cadastral",
        code: "CTR-1055",
        value: "R$ 3.120,00",
        date: "25 nov",
        status: "Divergência",
        statusVariant: "destructive",
        avatarName: "Atacado Central",
        icon: "alert-circle",
        actionLabel: "Corrigir",
        actionUrl: "#ctr-1055",
      },
    ],
    footerAction: {
      label: "Ver todos os registros",
      url: "#registros",
      variant: "outline",
      size: "sm",
      icon: "arrow-right",
    },
    emptyMessage: "Nenhum registro encontrado.",
    padding: paddingDefaults,
  },
  render: RecordList,
};

export default conf;
