import { createThemeFromPreset } from "~/theme/schema";
import type { TemplateDefinition } from "./types";

export const centralAtendimentoTemplate: TemplateDefinition = {
  id: "central-atendimento",
  name: "Central de atendimento",
  category: "Suporte e chamados",
  description:
    "Workspace operacional para filas de atendimento com indicadores de SLA, quadro Kanban de chamados e resumo por canal.",
  highlights: [
    "Quadro Kanban editável",
    "Indicadores de fila e SLA",
    "Agentes ativos e canais",
  ],
  previewKind: "kanban",
  defaultPresetId: "ocean-breeze",
  defaultNavigationMode: "sidebar",
  supportsNavigationModes: true,
  buildData: () => ({
    root: {
      props: {
        title: "AtendeDesk — Central de Atendimento",
        description:
          "Operação de chamados em quadro Kanban com indicadores e resumo por canal.",
        surface: "muted",
        navigationMode: "sidebar",
        density: "default",
        theme: createThemeFromPreset("ocean-breeze", "light"),
      },
    },
    content: [
      {
        type: "AppSidebar",
        props: {
          id: "AppSidebar-support-shell",
          brandName: "AtendeDesk",
          brandSubtitle: "Operação N1 · N2",
          brandIcon: "inbox",
          bordered: true,
          groups: [
            {
              title: "Atendimento",
              items: [
                {
                  label: "Quadro de chamados",
                  url: "#quadro",
                  icon: "layers",
                  badge: "18",
                  active: true,
                },
                {
                  label: "Fila prioritária",
                  url: "#prioritarios",
                  icon: "alert-circle",
                  badge: "4",
                  active: false,
                },
                {
                  label: "Mensagens",
                  url: "#mensagens",
                  icon: "mail",
                  badge: "9",
                  active: false,
                },
              ],
            },
            {
              title: "Relacionamento",
              items: [
                {
                  label: "Contas atendidas",
                  url: "#contas",
                  icon: "users",
                  badge: "",
                  active: false,
                },
                {
                  label: "Métricas de SLA",
                  url: "#sla",
                  icon: "pie-chart",
                  badge: "",
                  active: false,
                },
              ],
            },
          ],
          user: {
            name: "Camila Duarte",
            role: "Coordenação de Suporte",
            initials: "CD",
          },
          content: [
            {
              type: "PageHeader",
              props: {
                id: "PageHeader-support-1",
                title: "Central de Atendimento",
                subtitle:
                  "Distribuição de chamados por etapa, prazos de resposta e cobertura dos analistas em tempo real.",
                badge: {
                  label: "Turno comercial",
                  url: "",
                  variant: "secondary",
                },
                actions: [
                  {
                    label: "Regras de SLA",
                    url: "#sla",
                    variant: "outline",
                    size: "default",
                    icon: "clock",
                  },
                  {
                    label: "Abrir chamado",
                    url: "#novo-chamado",
                    variant: "default",
                    size: "default",
                    icon: "plus",
                  },
                ],
                showSeparator: true,
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "Stats",
              props: {
                id: "Stats-support-1",
                layout: "inline",
                statistics: [
                  {
                    label: "Chamados abertos",
                    value: "18",
                    percentage: 5.2,
                    direction: "decrease",
                    polarity: "positive",
                  },
                  {
                    label: "Em atendimento",
                    value: "9",
                    percentage: 11.0,
                    direction: "increase",
                    polarity: "none",
                  },
                  {
                    label: "Primeira resposta",
                    value: "14 min",
                    percentage: 18.4,
                    direction: "decrease",
                    polarity: "positive",
                  },
                  {
                    label: "Dentro do SLA",
                    value: "96,8%",
                    percentage: 1.4,
                    direction: "increase",
                    polarity: "positive",
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "KanbanBoard",
              props: {
                id: "KanbanBoard-support-1",
                title: "Fluxo de chamados",
                description:
                  "Acompanhe os tickets distribuídos entre triagem, atendimento técnico e conclusão.",
                columns: [
                  {
                    title: "Triagem",
                    badge: "2",
                    cards: [
                      {
                        code: "CH-2401",
                        title: "Falha ao gerar segunda via de fatura",
                        description:
                          "Conta corporativa relata erro ao baixar PDF do portal.",
                        priority: "alta",
                        assignee: "Clara Nogueira",
                        assigneeInitials: "CN",
                        tag: "Financeiro",
                        sla: "35m",
                      },
                      {
                        code: "CH-2404",
                        title: "Liberação de perfil auditor",
                        description:
                          "Solicitação de acesso somente leitura para equipe fiscal.",
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
                        code: "CH-2395",
                        title: "Atraso no webhook de pedidos",
                        description:
                          "Verificando fila de retentativas do parceiro logístico.",
                        priority: "alta",
                        assignee: "Marcos Vieira",
                        assigneeInitials: "MV",
                        tag: "Integrações",
                        sla: "50m",
                      },
                      {
                        code: "CH-2398",
                        title: "Atualização de certificado digital",
                        description:
                          "Conferência da validade em ambiente de homologação.",
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
                        code: "CH-2389",
                        title: "Envio de planilha padronizada",
                        description:
                          "Aguardando retorno com os códigos internos das filiais.",
                        priority: "baixa",
                        assignee: "Clara Nogueira",
                        assigneeInitials: "CN",
                        tag: "Implantação",
                        sla: "5h",
                      },
                    ],
                  },
                  {
                    title: "Concluído",
                    badge: "2",
                    cards: [
                      {
                        code: "CH-2382",
                        title: "Reinicialização de autenticação 2FA",
                        description:
                          "Novo vínculo validado diretamente com o solicitante.",
                        priority: "baixa",
                        assignee: "Lucas Prado",
                        assigneeInitials: "LP",
                        tag: "Segurança",
                        sla: "Resolvido",
                      },
                      {
                        code: "CH-2379",
                        title: "Ajuste de limite de usuários",
                        description:
                          "Cota expandida conforme aditivo contratual aprovado.",
                        priority: "media",
                        assignee: "Helena Dias",
                        assigneeInitials: "HD",
                        tag: "Contratos",
                        sla: "Resolvido",
                      },
                    ],
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "DashboardGrid",
              props: {
                id: "DashboardGrid-support-1",
                sectionTitle: "Contexto operacional",
                sectionDescription:
                  "Cobertura da equipe e desempenho por canal de entrada.",
                columns: "2",
                gap: "md",
                items: [
                  {
                    type: "UserSummaryCard",
                    props: {
                      id: "UserSummaryCard-support-1",
                      title: "Atendentes em linha",
                      description:
                        "Distribuição atual de chamados por especialista.",
                      members: [
                        {
                          name: "Clara Nogueira",
                          role: "Suporte N1 · Financeiro",
                          initials: "CN",
                          avatarUrl: "",
                          status: "4 ativos",
                          statusVariant: "default",
                        },
                        {
                          name: "Marcos Vieira",
                          role: "Suporte N2 · APIs",
                          initials: "MV",
                          avatarUrl: "",
                          status: "3 ativos",
                          statusVariant: "secondary",
                        },
                        {
                          name: "Helena Dias",
                          role: "Especialista Fiscal",
                          initials: "HD",
                          avatarUrl: "",
                          status: "Disponível",
                          statusVariant: "outline",
                        },
                      ],
                      footerButton: {
                        label: "Redistribuir fila",
                        url: "#fila",
                        variant: "outline",
                        size: "sm",
                        icon: "users",
                      },
                    },
                  },
                  {
                    type: "KeyValueTable",
                    props: {
                      id: "KeyValueTable-support-1",
                      title: "Desempenho por canal",
                      description:
                        "Tempo médio de primeira resposta e cumprimento de SLA.",
                      keyHeader: "Canal de entrada",
                      valueHeader: "Tempo médio",
                      rows: [
                        {
                          label: "Chat no painel",
                          value: "4 min",
                          badge: "99% SLA",
                          badgeVariant: "default",
                        },
                        {
                          label: "Portal do cliente",
                          value: "18 min",
                          badge: "96% SLA",
                          badgeVariant: "secondary",
                        },
                        {
                          label: "E-mail corporativo",
                          value: "32 min",
                          badge: "94% SLA",
                          badgeVariant: "secondary",
                        },
                        {
                          label: "Plantão crítico",
                          value: "6 min",
                          badge: "Prioritário",
                          badgeVariant: "outline",
                        },
                      ],
                      padding: { top: "none", bottom: "none" },
                    },
                  },
                ],
                padding: { top: "none", bottom: "none" },
              },
            },
          ],
        },
      },
    ],
    zones: {},
  }),
};
