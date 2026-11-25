import type { ComponentConfig } from "@puckeditor/core";
import { Footer, type FooterProps } from "./footer";
import { padding } from "~/puck/config/fields";

export type { FooterProps };

export const conf: ComponentConfig<FooterProps> = {
  label: "Rodapé",
  fields: {
    companyName: {
      label: "Nome da organização",
      type: "text",
      contentEditable: true,
    },
    tagLine: {
      label: "Descrição curta",
      type: "textarea",
      contentEditable: true,
    },
    address: {
      label: "Endereço / Copyright",
      type: "textarea",
      contentEditable: true,
    },
    navigation: {
      label: "Colunas de navegação",
      type: "array",
      max: 6,
      getItemSummary: (item, index = 0) => item.label || `Coluna ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Título", contentEditable: true },
        url: { type: "text", label: "URL opcional" },
        items: {
          type: "array",
          label: "Links",
          max: 8,
          getItemSummary: (item, index = 0) =>
            item.label || `Link ${index + 1}`,
          arrayFields: {
            label: { type: "text", label: "Rótulo", contentEditable: true },
            url: { type: "text", label: "URL" },
          },
          defaultItemProps: {
            label: "Link",
            url: "#",
          },
        },
      },
      defaultItemProps: {
        label: "Seção",
        url: "",
        items: [],
      },
    },
    legalLinks: {
      label: "Links legais",
      type: "array",
      max: 6,
      getItemSummary: (item, index = 0) => item?.label || `Link ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo", contentEditable: true },
        url: { type: "text", label: "URL" },
      },
      defaultItemProps: {
        label: "Política",
        url: "#",
      },
    },
    padding,
  },
  defaultProps: {
    padding: { top: "medium", bottom: "medium" },
    companyName: "AccioDesign",
    tagLine: "Laboratório visual de interfaces administrativas com Puck e shadcn/ui.",
    address: "Plataforma Operacional\nSão Paulo, SP\n© 2026 AccioDesign",
    navigation: [
      {
        label: "Módulos",
        items: [
          { label: "Visão Geral", url: "/" },
          { label: "Indicadores", url: "#indicadores" },
          { label: "Tabelas", url: "#tabelas" },
        ],
      },
      {
        label: "Administração",
        items: [
          { label: "Usuários", url: "#usuarios" },
          { label: "Auditoria", url: "#auditoria" },
          { label: "Configurações", url: "#configuracoes" },
        ],
      },
      {
        label: "Editor",
        items: [
          { label: "Abrir Editor (/edit)", url: "/edit" },
          { label: "Documentação", url: "#docs" },
        ],
      },
    ],
    legalLinks: [
      { label: "Termos de uso", url: "#termos" },
      { label: "Privacidade", url: "#privacidade" },
    ],
  },
  render: Footer,
};

export default conf;
