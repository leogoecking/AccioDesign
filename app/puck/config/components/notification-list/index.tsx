import type { ComponentConfig } from "@puckeditor/core";
import {
  booleanRadio,
  icon,
  padding,
  paddingDefaults,
} from "~/puck/config/fields";
import {
  NotificationList,
  type NotificationItem,
  type NotificationListViewProps,
} from "./notification-list";

export type NotificationListProps = NotificationListViewProps;

export const conf: ComponentConfig<NotificationListProps> = {
  label: "Lista de Notificações",
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
    grouped: booleanRadio("Agrupar não lidas e lidas"),
    showReadToggle: booleanRadio("Permitir alternar leitura"),
    showMarkAllAction: booleanRadio("Exibir botão Marcar todas"),
    items: {
      type: "array",
      label: "Notificações",
      max: 20,
      getItemSummary: (item: NotificationItem, index = 0) =>
        item?.title || `Notificação ${index + 1}`,
      arrayFields: {
        title: { type: "text", label: "Título" },
        description: { type: "textarea", label: "Mensagem" },
        timestamp: { type: "text", label: "Horário" },
        read: booleanRadio("Marcada como lida"),
        priority: {
          type: "select",
          label: "Prioridade",
          options: [
            { label: "Alta", value: "alta" },
            { label: "Normal", value: "normal" },
            { label: "Baixa", value: "baixa" },
          ],
        },
        mediaType: {
          type: "radio",
          label: "Visual",
          options: [
            { label: "Ícone", value: "icon" },
            { label: "Avatar", value: "avatar" },
          ],
        },
        icon,
        senderName: { type: "text", label: "Remetente (opcional)" },
        senderAvatarUrl: { type: "text", label: "URL do avatar (opcional)" },
        category: { type: "text", label: "Categoria" },
      },
      defaultItemProps: {
        title: "Nova solicitação aguardando revisão",
        description: "Pedido registrado pela equipe comercial para conferência.",
        timestamp: "Agora",
        read: false,
        priority: "normal",
        mediaType: "icon",
        icon: "bell",
        senderName: "Lucas Prado",
        category: "Operações",
      },
    },
    emptyMessage: {
      type: "text",
      label: "Mensagem quando vazio",
    },
    padding,
  },
  defaultProps: {
    title: "Central de Notificações",
    description:
      "Alertas prioritários, aprovações pendentes e comunicados internos.",
    grouped: true,
    showReadToggle: true,
    showMarkAllAction: true,
    items: [
      {
        title: "SLA crítico em risco no chamado #2401",
        description:
          "Cliente corporativo aguarda retorno financeiro nos próximos 15 minutos.",
        timestamp: "Há 6 min",
        read: false,
        priority: "alta",
        mediaType: "icon",
        icon: "alert-circle",
        senderName: "Monitoramento",
        category: "Suporte",
      },
      {
        title: "Marina Costa solicitou aprovação de contrato",
        description:
          "Aditivo anual da Horizonte Logística pronto para conferência final.",
        timestamp: "Há 28 min",
        read: false,
        priority: "normal",
        mediaType: "avatar",
        icon: "user",
        senderName: "Marina Costa",
        category: "Comercial",
      },
      {
        title: "Conciliação bancária concluída",
        description:
          "Todos os 148 boletos da remessa matinal foram processados sem divergências.",
        timestamp: "Há 2 horas",
        read: true,
        priority: "baixa",
        mediaType: "icon",
        icon: "check-circle-2",
        senderName: "Motor Financeiro",
        category: "Faturamento",
      },
    ],
    emptyMessage: "Nenhuma notificação pendente no momento.",
    padding: paddingDefaults,
  },
  render: NotificationList,
};

export default conf;
