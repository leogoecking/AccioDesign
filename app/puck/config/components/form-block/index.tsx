import type { ComponentConfig } from "@puckeditor/core";
import {
  contentFieldsWithFeatures,
  form,
  formDefaults,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import { FormBlock, type FormBlockProps } from "./form-block";

export type { FormBlockProps };

export const conf: ComponentConfig<FormBlockProps> = {
  label: "Bloco de Formulário",
  fields: {
    layout: {
      type: "radio",
      label: "Layout",
      options: [
        { label: "Dividido (texto + formulário)", value: "split" },
        { label: "Somente card", value: "card" },
      ],
    },
    ...contentFieldsWithFeatures,
    form,
    padding,
  },
  defaultProps: {
    layout: "split",
    badge: {
      label: "Solicitações",
      url: "",
      variant: "secondary",
    },
    heading: "Abrir chamado ou registrar alteração",
    description:
      "Centralize pedidos de acesso, ajustes cadastrais ou incidentes operacionais com rastreabilidade.",
    buttons: [],
    features: [
      {
        icon: "check",
        name: "Roteamento automático",
        description: "Encaminhado diretamente para a fila responsável.",
      },
      {
        icon: "clock",
        name: "Resposta dentro do SLA",
        description: "Notificações em tempo real para o solicitante.",
      },
    ],
    form: formDefaults,
    padding: paddingDefaults,
  },
  resolveFields: (data, params) => {
    if (data.props.layout === "card") {
      const { heading, description, badge, features, buttons, ...rest } =
        params.fields;
      return rest;
    }

    return params.fields;
  },
  render: FormBlock,
};

export default conf;
