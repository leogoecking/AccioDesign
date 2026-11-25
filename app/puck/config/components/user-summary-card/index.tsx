import type { ComponentConfig } from "@puckeditor/core";
import { badgeVariantField, button } from "~/puck/config/fields";
import { UserSummaryCard, type UserSummaryCardProps } from "./user-summary-card";

export type { UserSummaryCardProps };

export const conf: ComponentConfig<UserSummaryCardProps> = {
  label: "Card de Equipe / Usuários",
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
    members: {
      type: "array",
      label: "Usuários",
      max: 8,
      getItemSummary: (item, index = 0) => item.name || `Usuário ${index + 1}`,
      arrayFields: {
        name: { type: "text", label: "Nome" },
        role: { type: "text", label: "Cargo / Área" },
        initials: { type: "text", label: "Iniciais" },
        avatarUrl: { type: "text", label: "URL do avatar (opcional)" },
        status: { type: "text", label: "Status" },
        statusVariant: badgeVariantField,
      },
      defaultItemProps: {
        name: "Novo membro",
        role: "Analista de Operações",
        initials: "NM",
        avatarUrl: "",
        status: "Ativo",
        statusVariant: "secondary",
      },
    },
    footerButton: {
      ...button,
      label: "Botão no rodapé",
    },
  },
  defaultProps: {
    title: "Responsáveis de Plantão",
    description: "Operadores com acesso administrativo ativo neste turno.",
    members: [
      {
        name: "Marina Costa",
        role: "Líder de Operações",
        initials: "MC",
        avatarUrl: "",
        status: "Online",
        statusVariant: "default",
      },
      {
        name: "Rafael Mendes",
        role: "Engenharia de Plataforma",
        initials: "RM",
        avatarUrl: "",
        status: "Em atendimento",
        statusVariant: "secondary",
      },
      {
        name: "Juliana Alves",
        role: "Compliance & Auditoria",
        initials: "JA",
        avatarUrl: "",
        status: "Disponível",
        statusVariant: "outline",
      },
    ],
    footerButton: {
      label: "Gerenciar permissões",
      url: "#permissoes",
      variant: "outline",
      size: "sm",
      icon: "users",
    },
  },
  render: UserSummaryCard,
};

export default conf;
