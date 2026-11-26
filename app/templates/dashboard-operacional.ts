import { createThemeFromPreset } from "~/theme/schema";
import type { TemplateDefinition } from "./types";

export const dashboardOperacionalTemplate: TemplateDefinition = {
  id: "dashboard-operacional",
  name: "Dashboard operacional",
  category: "Monitoramento e equipe",
  description:
    "Painel de desempenho em tempo real com KPIs, status de serviços, escala da equipe e movimentações recentes.",
  highlights: [
    "Indicadores de desempenho",
    "Saúde dos serviços e equipe",
    "Movimentações operacionais",
  ],
  previewKind: "dashboard",
  defaultPresetId: "clean-slate",
  defaultNavigationMode: "sidebar",
  supportsNavigationModes: true,
  buildData: () => ({
    root: {
      props: {
        title: "PulseOps — Dashboard Operacional",
        description:
          "Acompanhamento de desempenho, equipe de plantão e eventos recentes.",
        surface: "muted",
        navigationMode: "sidebar",
        density: "default",
        theme: createThemeFromPreset("clean-slate", "light"),
      },
    },
    content: [
      {
        type: "AppSidebar",
        props: {
          id: "AppSidebar-ops-shell",
          brandName: "PulseOps",
          brandSubtitle: "Centro Operacional",
          brandIcon: "activity",
          bordered: true,
          groups: [
            {
              title: "Monitoramento",
              items: [
                {
                  label: "Visão Geral",
                  url: "#visao-geral",
                  icon: "layout-dashboard",
                  badge: "",
                  active: true,
                },
                {
                  label: "Indicadores",
                  url: "#indicadores",
                  icon: "trending-up",
                  badge: "4",
                  active: false,
                },
                {
                  label: "Eventos",
                  url: "#eventos",
                  icon: "bell",
                  badge: "12",
                  active: false,
                },
              ],
            },
            {
              title: "Equipes e Rede",
              items: [
                {
                  label: "Escala de plantão",
                  url: "#equipe",
                  icon: "users",
                  badge: "",
                  active: false,
                },
                {
                  label: "Infraestrutura",
                  url: "#infra",
                  icon: "database",
                  badge: "",
                  active: false,
                },
              ],
            },
          ],
          user: {
            name: "Rafael Mendes",
            role: "Líder de Operações",
            initials: "RM",
          },
          content: [
            {
              type: "PageHeader",
              props: {
                id: "PageHeader-ops-1",
                title: "Dashboard Operacional",
                subtitle:
                  "Acompanhe disponibilidade dos serviços, capacidade do time e transações processadas nas últimas 24 horas.",
                badge: {
                  label: "Monitoramento ativo",
                  url: "",
                  variant: "secondary",
                },
                actions: [
                  {
                    label: "Registrar ocorrência",
                    url: "#ocorrencia",
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
                id: "Stats-ops-1",
                layout: "inline",
                statistics: [
                  {
                    label: "Disponibilidade",
                    value: "99,94%",
                    percentage: 0.2,
                    direction: "increase",
                    polarity: "positive",
                  },
                  {
                    label: "Latência média",
                    value: "142 ms",
                    percentage: 8.5,
                    direction: "decrease",
                    polarity: "positive",
                  },
                  {
                    label: "Eventos processados",
                    value: "48.320",
                    percentage: 12.4,
                    direction: "increase",
                    polarity: "positive",
                  },
                  {
                    label: "Alertas abertos",
                    value: "3",
                    percentage: 25.0,
                    direction: "decrease",
                    polarity: "positive",
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "StatusBadgeGroup",
              props: {
                id: "StatusBadgeGroup-ops-1",
                title: "Saúde dos serviços",
                items: [
                  {
                    label: "API Principal",
                    value: "99,9%",
                    tooltip: "Operando dentro da meta de latência",
                    variant: "default",
                    icon: "check-circle-2",
                  },
                  {
                    label: "Mensageria",
                    value: "Fila normal",
                    tooltip: "Atraso médio inferior a 2 segundos",
                    variant: "secondary",
                    icon: "activity",
                  },
                  {
                    label: "Gateway Fiscal",
                    value: "Oscilação leve",
                    tooltip: "Monitoramento preventivo ativado",
                    variant: "outline",
                    icon: "clock",
                  },
                  {
                    label: "Faturamento",
                    value: "Operacional",
                    tooltip: "Sem falhas nas últimas 6 horas",
                    variant: "secondary",
                    icon: "shield",
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "DashboardGrid",
              props: {
                id: "DashboardGrid-ops-1",
                sectionTitle: "Desempenho e equipe de plantão",
                sectionDescription:
                  "Resumo de entregas operacionais e disponibilidade imediata dos especialistas.",
                columns: "2",
                gap: "md",
                items: [
                  {
                    type: "KpiCard",
                    props: {
                      id: "KpiCard-ops-1",
                      title: "Volume financeiro liquidado",
                      value: "R$ 842.650,00",
                      delta: "+14,3%",
                      trend: "up",
                      helperText: "Comparado à média dos últimos 7 dias",
                      icon: "dollar-sign",
                      badgeLabel: "Meta superada",
                      badgeVariant: "secondary",
                    },
                  },
                  {
                    type: "UserSummaryCard",
                    props: {
                      id: "UserSummaryCard-ops-1",
                      title: "Resumo da equipe",
                      description: "Especialistas escalados para o turno atual.",
                      members: [
                        {
                          name: "Rafael Mendes",
                          role: "Coordenação SRE",
                          initials: "RM",
                          avatarUrl: "",
                          status: "Online",
                          statusVariant: "default",
                        },
                        {
                          name: "Juliana Alves",
                          role: "Análise de Dados",
                          initials: "JA",
                          avatarUrl: "",
                          status: "Em acompanhamento",
                          statusVariant: "secondary",
                        },
                        {
                          name: "Tiago Nogueira",
                          role: "Integrações",
                          initials: "TN",
                          avatarUrl: "",
                          status: "Disponível",
                          statusVariant: "outline",
                        },
                      ],
                      footerButton: {
                        label: "Ver escala completa",
                        url: "#escala",
                        variant: "outline",
                        size: "sm",
                        icon: "users",
                      },
                    },
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "DataTable",
              props: {
                id: "DataTable-ops-1",
                title: "Movimentações recentes",
                description:
                  "Últimas rotinas, liquidações e sincronizações concluídas pelo sistema.",
                caption: "Registros demonstrativos ordenados por horário.",
                showSearch: true,
                searchPlaceholder: "Buscar por protocolo ou origem...",
                headers: {
                  col1: "Protocolo",
                  col2: "Fluxo / Origem",
                  col3: "Responsável",
                  col4: "Horário",
                  status: "Estado",
                },
                showColumn3: true,
                showColumn4: true,
                showStatus: true,
                rows: [
                  {
                    col1: "MOV-4812",
                    col2: "Conciliação bancária automática",
                    col3: "Motor Financeiro",
                    col4: "Há 8 min",
                    status: "Concluído",
                    statusVariant: "default",
                  },
                  {
                    col1: "MOV-4811",
                    col2: "Sincronização ERP regional Sul",
                    col3: "Tiago Nogueira",
                    col4: "Há 24 min",
                    status: "Em execução",
                    statusVariant: "secondary",
                  },
                  {
                    col1: "MOV-4810",
                    col2: "Recálculo de SLA de entregas",
                    col3: "Juliana Alves",
                    col4: "Há 1 hora",
                    status: "Concluído",
                    statusVariant: "default",
                  },
                  {
                    col1: "MOV-4809",
                    col2: "Reprocessamento de notas fiscais",
                    col3: "Gateway Fiscal",
                    col4: "Há 2 horas",
                    status: "Atenção",
                    statusVariant: "destructive",
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
