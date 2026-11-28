import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  icon,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  ActivityTimeline,
  type ActivityTimelineItem,
  type ActivityTimelineViewProps,
} from "./activity-timeline";

export type ActivityTimelineProps = ActivityTimelineViewProps;

export const conf: ComponentConfig<ActivityTimelineProps> = {
  label: "Linha do Tempo",
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
    groupByDate: booleanRadio("Agrupar por data"),
    compact: booleanRadio("Modo compacto"),
    showCategory: booleanRadio("Exibir categoria"),
    items: {
      type: "array",
      label: "Eventos do histórico",
      max: 16,
      getItemSummary: (item: ActivityTimelineItem, index = 0) =>
        item?.title || `Evento ${index + 1}`,
      arrayFields: {
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Descrição" },
        dateLabel: { type: "text", label: "Data do grupo" },
        timestamp: { type: "text", label: "Horário" },
        actor: { type: "text", label: "Responsável" },
        category: { type: "text", label: "Categoria" },
        status: {
          type: "select",
          label: "Estado",
          options: [
            { label: "Neutro", value: "default" },
            { label: "Sucesso", value: "success" },
            { label: "Atenção", value: "warning" },
            { label: "Erro", value: "error" },
          ],
        },
        icon,
      },
      defaultItemProps: {
        title: "Registro atualizado",
        description: "Alteração validada no fluxo operacional.",
        dateLabel: "Hoje",
        timestamp: "10:15",
        actor: "Equipe Operacional",
        category: "Sistema",
        status: "default",
        icon: "activity",
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Histórico de Atividades",
    description:
      "Eventos recentes de faturamento, aprovações e monitoramento operacional.",
    badgeLabel: "Tempo real",
    groupByDate: true,
    compact: false,
    showCategory: true,
    items: [
      {
        title: "Pedido #4829 aprovado automaticamente",
        description:
          "Conciliação financeira confirmada e nota fiscal enviada para o cliente.",
        dateLabel: "Hoje",
        timestamp: "14:32",
        actor: "Marina Costa",
        category: "Faturamento",
        status: "success",
        icon: "check-circle-2",
      },
      {
        title: "Oscilação detectada no gateway fiscal",
        description:
          "Fila de contingência ativada com reprocessamento automático a cada 5 min.",
        dateLabel: "Hoje",
        timestamp: "11:18",
        actor: "Monitoramento SRE",
        category: "Infraestrutura",
        status: "warning",
        icon: "clock",
      },
      {
        title: "Novo contrato corporativo cadastrado",
        description:
          "Organização Horizonte Logística vinculada ao plano Enterprise anual.",
        dateLabel: "Ontem",
        timestamp: "17:45",
        actor: "Rafael Mendes",
        category: "Comercial",
        status: "default",
        icon: "building-2",
      },
      {
        title: "Falha na sincronização do webhook ERP",
        description:
          "Endpoint retornou HTTP 504; notificação encaminhada ao plantão N2.",
        dateLabel: "Ontem",
        timestamp: "09:20",
        actor: "Integração ERP",
        category: "Integrações",
        status: "error",
        icon: "alert-circle",
      },
    ],
    emptyMessage: "Nenhuma atividade registrada no histórico.",
    padding: paddingDefaults,
  },
  render: ActivityTimeline,
};

export default conf;
