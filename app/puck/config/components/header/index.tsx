import type { ComponentConfig } from "@puckeditor/core";
import { Header, type HeaderProps } from "./header";
import { booleanRadio, button } from "~/puck/config/fields";

export type { HeaderProps };

export const defaultPrimaryNavigationItems = [
  {
    label: "Visão Geral",
    url: "/",
    description: "",
    items: [],
    cta: {
      label: "",
      url: "",
      size: "default" as const,
      variant: "default" as const,
      icon: "none" as const,
    },
  },
  {
    label: "Operações",
    description: "Acompanhe filas, pedidos, métricas de SLA e auditoria.",
    cta: {
      label: "Abrir relatórios",
      url: "#relatorios",
      size: "sm" as const,
      variant: "default" as const,
      icon: "arrow-right" as const,
    },
    items: [
      { label: "Relatórios", url: "#relatorios" },
      { label: "Indicadores", url: "#indicadores" },
      { label: "Painéis", url: "#paineis" },
      { label: "Registros", url: "#registros" },
    ],
  },
  {
    label: "Administração",
    description: "Controle de acessos, equipes e parâmetros do sistema.",
    cta: {
      label: "Configurações",
      url: "#configuracoes",
      size: "sm" as const,
      variant: "outline" as const,
      icon: "settings" as const,
    },
    items: [
      { label: "Usuários", url: "#usuarios" },
      { label: "Permissões", url: "#permissoes" },
      { label: "Integrações", url: "#integracoes" },
    ],
  },
];

const defaultSecondaryNavigationItems = [
  {
    label: "Documentação",
    url: "#docs",
    variant: "ghost" as const,
    icon: "none" as const,
    divider: true,
    isHiddenOnMobile: true,
  },
  {
    label: "Editor",
    url: "/edit",
    variant: "outline" as const,
    icon: "layers" as const,
    divider: false,
    isHiddenOnMobile: false,
  },
];

export const conf: ComponentConfig<HeaderProps> = {
  label: "Cabeçalho",
  fields: {
    companyName: {
      label: "Nome da marca",
      type: "text",
      contentEditable: true,
    },
    primaryNavigation: {
      label: "Navegação principal",
      type: "array",
      max: 5,
      getItemSummary: (item, index = 0) => item.label || `Item ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        url: { type: "text", label: "URL (vazio para submenu)" },
        description: { type: "textarea", label: "Descrição do submenu" },
        cta: button,
        items: {
          type: "array",
          label: "Subitens",
          max: 6,
          getItemSummary: (item, index = 0) =>
            item.label || `Subitem ${index + 1}`,
          arrayFields: {
            label: { type: "text", label: "Rótulo" },
            url: { type: "text", label: "URL" },
          },
          defaultItemProps: {
            label: "Subitem",
            url: "#",
          },
        },
      },
      defaultItemProps: {
        label: "Menu",
        url: "",
        description: "Descrição exibida quando não há URL direta.",
        cta: {
          label: "Ver todos",
          url: "#",
          variant: "default" as const,
          size: "sm" as const,
          icon: "none" as const,
        },
        items: [],
      },
    },
    secondaryNavigation: {
      label: "Ações à direita",
      type: "array",
      max: 4,
      getItemSummary: (item, index = 0) => item.label || `Ação ${index + 1}`,
      arrayFields: {
        label: { type: "text", label: "Rótulo" },
        url: { type: "text", label: "URL" },
        variant: button.objectFields.variant,
        icon: button.objectFields.icon,
        divider: booleanRadio("Divisor"),
        isHiddenOnMobile: booleanRadio("Ocultar em telas pequenas"),
      },
      defaultItemProps: {
        label: "Ação",
        url: "#",
        variant: "outline" as const,
        icon: "none" as const,
        divider: false,
        isHiddenOnMobile: true,
      },
    },
  },
  defaultProps: {
    companyName: "AccioDesign",
    primaryNavigation: defaultPrimaryNavigationItems,
    secondaryNavigation: defaultSecondaryNavigationItems,
  },
  render: Header,
};

export default conf;
