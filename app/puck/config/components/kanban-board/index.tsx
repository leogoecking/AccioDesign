import type { ComponentConfig } from "@puckeditor/core";
import { padding, paddingDefaults } from "~/puck/config/fields";
import {
  KanbanBoard,
  type KanbanBoardProps,
  type KanbanColumnItem,
} from "./kanban-board";

export type { KanbanBoardProps, KanbanColumnItem };

export const conf: ComponentConfig<KanbanBoardProps> = {
  label: "Quadro Kanban",
  fields: {
    title: {
      type: "text",
      label: "Título do quadro",
      contentEditable: true,
    },
    description: {
      type: "textarea",
      label: "Descrição",
      contentEditable: true,
    },
    columns: {
      type: "array",
      label: "Colunas",
      max: 6,
      getItemSummary: (item: KanbanColumnItem, index = 0) =>
        item.title || `Coluna ${index + 1}`,
      arrayFields: {
        title: { type: "text", label: "Título da coluna" },
        badge: { type: "text", label: "Contador" },
        cards: {
          type: "array",
          label: "Cartões",
          max: 12,
          getItemSummary: (card, idx = 0) =>
            card.code ? `${card.code} · ${card.title}` : `Cartão ${idx + 1}`,
          arrayFields: {
            code: { type: "text", label: "Código" },
            title: { type: "text", label: "Título" },
            description: { type: "textarea", label: "Resumo" },
            priority: {
              type: "select",
              label: "Prioridade",
              options: [
                { label: "Alta", value: "alta" },
                { label: "Média", value: "media" },
                { label: "Baixa", value: "baixa" },
              ],
            },
            assignee: { type: "text", label: "Responsável" },
            assigneeInitials: { type: "text", label: "Iniciais" },
            tag: { type: "text", label: "Categoria" },
            sla: { type: "text", label: "SLA / Prazo" },
          },
          defaultItemProps: {
            code: "CH-1090",
            title: "Novo atendimento",
            description: "Solicitação aguardando triagem inicial.",
            priority: "media",
            assignee: "Ana Beatriz",
            assigneeInitials: "AB",
            tag: "Suporte",
            sla: "2h",
          },
        },
      },
      defaultItemProps: {
        title: "Nova coluna",
        badge: "1",
        cards: [
          {
            code: "CH-1091",
            title: "Verificação de acesso",
            description: "Conferir permissões do perfil financeiro.",
            priority: "media",
            assignee: "Lucas Prado",
            assigneeInitials: "LP",
            tag: "Acesso",
            sla: "1h 30m",
          },
        ],
      },
    },
    padding,
  },
  defaultProps: {
    title: "Quadro de chamados",
    description: "Acompanhamento visual por etapa do fluxo de atendimento.",
    columns: [
      {
        title: "Triagem",
        badge: "2",
        cards: [
          {
            code: "CH-2401",
            title: "Erro ao emitir segunda via de boleto",
            description: "Cliente corporativo relata timeout na guia financeira.",
            priority: "alta",
            assignee: "Clara Nogueira",
            assigneeInitials: "CN",
            tag: "Financeiro",
            sla: "45m",
          },
          {
            code: "CH-2402",
            title: "Liberar acesso de auditoria",
            description: "Solicitação aprovada pela gerência regional.",
            priority: "media",
            assignee: "Lucas Prado",
            assigneeInitials: "LP",
            tag: "Acessos",
            sla: "2h",
          },
        ],
      },
      {
        title: "Em atendimento",
        badge: "2",
        cards: [
          {
            code: "CH-2394",
            title: "Divergência na conciliação bancária",
            description: "Análise dos retornos CNAB da última remessa.",
            priority: "alta",
            assignee: "Marcos Vieira",
            assigneeInitials: "MV",
            tag: "Integrações",
            sla: "1h 15m",
          },
          {
            code: "CH-2397",
            title: "Atualização de certificado A1",
            description: "Validação em homologação antes de virar produção.",
            priority: "media",
            assignee: "Helena Dias",
            assigneeInitials: "HD",
            tag: "Fiscal",
            sla: "3h",
          },
        ],
      },
      {
        title: "Aguardando cliente",
        badge: "1",
        cards: [
          {
            code: "CH-2388",
            title: "Reenvio de planilha de importação",
            description: "Aguardando arquivo atualizado com coluna de CNPJ.",
            priority: "baixa",
            assignee: "Clara Nogueira",
            assigneeInitials: "CN",
            tag: "Onboarding",
            sla: "6h",
          },
        ],
      },
      {
        title: "Concluído",
        badge: "1",
        cards: [
          {
            code: "CH-2380",
            title: "Redefinição de autenticação 2FA",
            description: "Token reemitido e validado com o usuário.",
            priority: "baixa",
            assignee: "Lucas Prado",
            assigneeInitials: "LP",
            tag: "Segurança",
            sla: "Resolvido",
          },
        ],
      },
    ],
    padding: paddingDefaults,
  },
  render: KanbanBoard,
};

export default conf;
