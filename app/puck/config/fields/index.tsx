import type { Field } from "@puckeditor/core";
import { ICON_OPTIONS } from "~/puck/components/icon";
import {
  fieldTypes,
  type CompoundFieldProps,
} from "~/puck/components/field";
import {
  formMethods,
  type CompoundFormProps,
  type FormMethods,
} from "~/puck/components/form";

export const booleanRadio = (label?: string) =>
  ({
    type: "radio",
    ...(label ? { label } : {}),
    options: [
      { label: "Sim", value: true },
      { label: "Não", value: false },
    ],
  }) as const;

export const icon = {
  type: "select",
  label: "Ícone",
  options: ICON_OPTIONS,
} as const;

export const button = {
  type: "object",
  label: "Botão",
  objectFields: {
    label: { type: "text", label: "Rótulo" },
    url: { type: "text", label: "URL" },
    variant: {
      type: "select",
      label: "Variante",
      options: [
        { label: "Primário", value: "default" },
        { label: "Secundário", value: "secondary" },
        { label: "Contorno", value: "outline" },
        { label: "Fantasma", value: "ghost" },
        { label: "Link", value: "link" },
        { label: "Destrutivo", value: "destructive" },
      ],
    },
    size: {
      type: "select",
      label: "Tamanho",
      options: [
        { label: "Padrão", value: "default" },
        { label: "Extra pequeno", value: "xs" },
        { label: "Pequeno", value: "sm" },
        { label: "Grande", value: "lg" },
        { label: "Ícone", value: "icon" },
      ],
    },
    icon,
  },
} as const;

export const buttonDefaults = {
  label: "Ação",
  url: "",
  variant: "default",
  size: "default",
  icon: "none",
} as const;

export const buttons = {
  type: "array",
  label: "Botões",
  max: 3,
  getItemSummary: (item: { label?: string }, index = 0) =>
    item.label || `Botão ${index + 1}`,
  arrayFields: {
    ...button.objectFields,
  },
  defaultItemProps: buttonDefaults,
} as const;

export const badgeVariantField = {
  type: "select",
  label: "Variante",
  options: [
    { label: "Padrão", value: "default" },
    { label: "Secundário", value: "secondary" },
    { label: "Destrutivo", value: "destructive" },
    { label: "Contorno", value: "outline" },
  ],
} as const;

export const badge = {
  type: "object",
  label: "Badge",
  objectFields: {
    label: { type: "text", label: "Texto" },
    url: { type: "text", label: "URL" },
    variant: badgeVariantField,
  },
} as const;

export const paddingLevel = {
  type: "select",
  options: [
    { label: "Nenhum", value: "none" },
    { label: "Pequeno", value: "small" },
    { label: "Médio", value: "medium" },
    { label: "Grande", value: "large" },
  ],
} as const;

export const padding = {
  type: "object",
  label: "Espaçamento vertical",
  objectFields: {
    top: { ...paddingLevel, label: "Superior" },
    bottom: { ...paddingLevel, label: "Inferior" },
  },
} as const;

export const paddingDefaults = {
  top: "small",
  bottom: "small",
} as const;

export const heading = {
  type: "text",
  label: "Título",
  contentEditable: true,
} as const;

export const description = {
  type: "textarea",
  label: "Descrição",
  contentEditable: true,
} as const;

export const features = {
  type: "array",
  label: "Destaques",
  max: 5,
  getItemSummary: (item: { name?: string }, index = 0) =>
    item.name || `Item ${index + 1}`,
  arrayFields: {
    icon,
    name: { type: "text", label: "Título", contentEditable: true },
    description: {
      type: "textarea",
      label: "Descrição",
      contentEditable: true,
    },
  },
  defaultItemProps: {
    icon: "check",
    name: "Recurso administrativo",
    description: "Descrição resumida da funcionalidade.",
  },
} as const;

export const contentFields = {
  heading,
  description,
  badge,
  buttons,
} as const;

export const contentFieldsWithFeatures = {
  heading,
  description,
  badge,
  features,
  buttons,
} as const;

export const card = {
  type: "object",
  label: "Card",
  objectFields: {
    icon,
    heading,
    description,
    button,
  },
} as const;

export const cards = {
  type: "array",
  label: "Cards",
  getItemSummary: (item: { heading?: string }, index = 0) =>
    item.heading || `Card ${index + 1}`,
  arrayFields: {
    ...card.objectFields,
  },
  defaultItemProps: {
    icon: "activity",
    heading: "Indicador operacional",
    description: "Resumo de atividade e desempenho do módulo.",
    button: buttonDefaults,
  },
} as const;

export const field: Field<CompoundFieldProps> = {
  type: "object",
  label: "Campo",
  objectFields: {
    label: { type: "text", label: "Rótulo", contentEditable: true },
    name: { type: "text", label: "Nome (name)" },
    type: {
      type: "select",
      label: "Tipo",
      options: fieldTypes.map((type) => ({ label: type, value: type })),
    },
    placeholder: { type: "text", label: "Placeholder" },
    required: booleanRadio("Obrigatório"),
  },
};

export const fieldDefaults: CompoundFieldProps = {
  label: "Nome do campo",
  type: "text",
  name: "campo",
  placeholder: "Digite aqui...",
  required: false,
};

const { url: _unusedUrl, ...formButtonConfig } = button.objectFields;

export const form: Field<CompoundFormProps> = {
  type: "object",
  label: "Formulário",
  objectFields: {
    title: { type: "text", label: "Título", contentEditable: true },
    description: { type: "textarea", label: "Descrição", contentEditable: true },
    fields: {
      type: "array",
      label: "Campos",
      min: 1,
      max: 10,
      arrayFields: { ...field.objectFields },
      getItemSummary: (item: { label?: string }, index = 0) =>
        item.label || `Campo ${index + 1}`,
      defaultItemProps: fieldDefaults,
    },
    action: { type: "text", label: "URL de envio (action)" },
    method: {
      type: "select",
      label: "Método HTTP",
      options: formMethods.map((method) => ({ label: method.toUpperCase(), value: method })),
    },
    button: {
      ...button,
      label: "Botão de envio",
      objectFields: {
        ...formButtonConfig,
      },
    },
  },
};

export const formDefaults: CompoundFormProps = {
  title: "Nova solicitação operacional",
  description: "Preencha os dados para registrar uma nova ocorrência ou configuração.",
  fields: [
    {
      label: "Responsável",
      type: "text",
      name: "responsavel",
      placeholder: "Ex.: Ana Souza",
      required: true,
    },
    {
      label: "E-mail corporativo",
      type: "email",
      name: "email",
      placeholder: "ana@empresa.com",
      required: true,
    },
    {
      label: "Observações",
      type: "textarea",
      name: "observacoes",
      placeholder: "Descreva os detalhes relevantes...",
      required: false,
    },
  ],
  action: "/api/solicitacoes",
  method: "post" as FormMethods,
  button: {
    label: "Enviar solicitação",
    variant: "default",
    size: "default",
    icon: "move-right",
  },
};
