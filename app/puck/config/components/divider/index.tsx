import type { ComponentConfig } from "@puckeditor/core";
import { Divider, type DividerProps } from "./divider";

export type { DividerProps };

export const conf: ComponentConfig<DividerProps> = {
  label: "Divisor de Seção",
  fields: {
    label: {
      type: "text",
      label: "Rótulo central (opcional)",
      contentEditable: true,
    },
    spacing: {
      type: "radio",
      label: "Espaçamento",
      options: [
        { label: "Compacto", value: "sm" },
        { label: "Médio", value: "md" },
        { label: "Amplo", value: "lg" },
      ],
    },
  },
  defaultProps: {
    label: "",
    spacing: "md",
  },
  render: Divider,
};

export default conf;
