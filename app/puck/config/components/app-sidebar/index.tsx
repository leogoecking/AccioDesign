import type { ComponentConfig } from "@puckeditor/core";
import { booleanRadio, icon } from "~/puck/config/fields";
import { AppSidebar, type AppSidebarProps } from "./app-sidebar";

export type { AppSidebarProps };

export const conf: ComponentConfig<AppSidebarProps> = {
  label: "Sidebar Lateral",
  fields: {
    brandName: {
      type: "text",
      label: "Nome do workspace",
      contentEditable: true,
    },
    brandSubtitle: {
      type: "text",
      label: "Subtítulo",
      contentEditable: true,
    },
    brandIcon: icon,
    groups: {
      type: "array",
      label: "Grupos de navegação",
      max: 5,
      getItemSummary: (item, index = 0) => item.title || `Grupo ${index + 1}`,
      arrayFields: {
        title: { type: "text", label: "Título do grupo" },
        items: {
          type: "array",
          label: "Links",
          max: 8,
          getItemSummary: (item, index = 0) => item.label || `Link ${index + 1}`,
          arrayFields: {
            label: { type: "text", label: "Rótulo" },
            url: { type: "text", label: "URL" },
            icon,
            badge: { type: "text", label: "Contador/Badge" },
            active: booleanRadio("Ativo"),
          },
          defaultItemProps: {
            label: "Novo item",
            url: "#",
            icon: "home",
            badge: "",
            active: false,
          },
        },
      },
      defaultItemProps: {
        title: "Seção",
        items: [
          {
            label: "Visão Geral",
            url: "#",
            icon: "layout-dashboard",
            badge: "",
            active: false,
          },
        ],
      },
    },
    user: {
      type: "object",
      label: "Usuário no rodapé",
      objectFields: {
        name: { type: "text", label: "Nome" },
        role: { type: "text", label: "Cargo" },
        initials: { type: "text", label: "Iniciais" },
      },
    },
    bordered: booleanRadio("Mostrar borda externa"),
    content: {
      type: "slot",
      label: "Área principal (arraste blocos aqui)",
    },
  },
  defaultProps: {
    brandName: "AccioAdmin",
    brandSubtitle: "Console v2.4",
    brandIcon: "layout-dashboard",
    bordered: true,
    groups: [
      {
        title: "Principal",
        items: [
          {
            label: "Visão Geral",
            url: "#visao-geral",
            icon: "layout-dashboard",
            badge: "",
            active: true,
          },
          {
            label: "Pedidos",
            url: "#pedidos",
            icon: "shopping-cart",
            badge: "12",
            active: false,
          },
          {
            label: "Clientes",
            url: "#clientes",
            icon: "users",
            badge: "",
            active: false,
          },
        ],
      },
      {
        title: "Sistema",
        items: [
          {
            label: "Relatórios",
            url: "#relatorios",
            icon: "bar-chart-3",
            badge: "",
            active: false,
          },
          {
            label: "Configurações",
            url: "#configuracoes",
            icon: "settings",
            badge: "",
            active: false,
          },
        ],
      },
    ],
    user: {
      name: "Marina Costa",
      role: "Administradora",
      initials: "MC",
    },
    content: [],
  },
  render: AppSidebar,
};

export default conf;
