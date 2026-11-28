import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  icon,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  AgendaCard,
  type AgendaCardViewProps,
  type AgendaEventItem,
} from "./agenda-card";

export type AgendaCardProps = AgendaCardViewProps;

export const conf: ComponentConfig<AgendaCardProps> = {
  label: "Agenda de Eventos",
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
    highlightNext: booleanRadio("Destacar próximo compromisso"),
    showCategory: booleanRadio("Exibir categoria"),
    items: {
      type: "array",
      label: "Compromissos",
      max: 16,
      getItemSummary: (item: AgendaEventItem, index = 0) =>
        item?.title
          ? `${item.startTime || ""} · ${item.title}`
          : `Evento ${index + 1}`,
      arrayFields: {
        dateLabel: { type: "text", label: "Data" },
        startTime: { type: "text", label: "Início" },
        endTime: { type: "text", label: "Término (opcional)" },
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Descrição" },
        location: { type: "text", label: "Local ou sala" },
        category: { type: "text", label: "Categoria" },
        status: {
          type: "select",
          label: "Estado",
          options: [
            { label: "Próximo (destaque)", value: "next" },
            { label: "Agendado", value: "upcoming" },
            { label: "Concluído", value: "done" },
            { label: "Cancelado", value: "cancelled" },
          ],
        },
        icon,
      },
      defaultItemProps: {
        dateLabel: "Amanhã",
        startTime: "10:00",
        endTime: "11:00",
        title: "Alinhamento semanal",
        description: "Revisão de entregas e prioridades da equipe.",
        location: "Sala Virtual 01",
        category: "Gestão",
        status: "upcoming",
        icon: "calendar",
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Agenda Operacional",
    description:
      "Compromissos de implantação, revisões financeiras e janelas de manutenção.",
    badgeLabel: "Esta semana",
    highlightNext: true,
    showCategory: true,
    items: [
      {
        dateLabel: "Hoje · 28 nov",
        startTime: "09:00",
        endTime: "09:45",
        title: "Passagem de plantão N1/N2",
        description: "Conferência dos chamados abertos e alertas resolvidos.",
        location: "Canal Operações",
        category: "Rotina",
        status: "done",
        icon: "check-circle-2",
      },
      {
        dateLabel: "Hoje · 28 nov",
        startTime: "14:30",
        endTime: "15:30",
        title: "Implantação Horizonte Logística",
        description:
          "Validação de permissões administrativas e importação inicial de contratos.",
        location: "Sala Executiva B",
        category: "Implantação",
        status: "next",
        icon: "users",
      },
      {
        dateLabel: "Amanhã · 29 nov",
        startTime: "10:00",
        endTime: "11:00",
        title: "Comitê de fechamento mensal",
        description: "Conferência de faturamento recorrente e inadimplência.",
        location: "Videoconferência",
        category: "Financeiro",
        status: "upcoming",
        icon: "calendar",
      },
      {
        dateLabel: "Amanhã · 29 nov",
        startTime: "22:00",
        endTime: "23:00",
        title: "Janela de atualização do gateway fiscal",
        description: "Aplicação de certificado digital sem indisponibilidade prevista.",
        location: "Ambiente Produção",
        category: "Infraestrutura",
        status: "upcoming",
        icon: "shield",
      },
    ],
    emptyMessage: "Nenhum compromisso agendado para o período.",
    padding: paddingDefaults,
  },
  render: AgendaCard,
};

export default conf;
