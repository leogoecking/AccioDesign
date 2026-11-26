import { createThemeFromPreset } from "~/theme/schema";
import type { TemplateDefinition } from "./types";

export const sistemaAdministrativoTemplate: TemplateDefinition = {
  id: "sistema-administrativo",
  name: "Sistema administrativo",
  category: "Gestão e cadastros",
  description:
    "Estrutura completa com navegação lateral, indicadores de carteira, filtros de busca, listagem de registros e cadastro.",
  highlights: [
    "Navegação lateral adaptável",
    "Tabela com busca e filtros",
    "Formulário de novo registro",
  ],
  previewKind: "admin",
  defaultPresetId: "default",
  defaultNavigationMode: "sidebar",
  supportsNavigationModes: true,
  buildData: () => ({
    root: {
      props: {
        title: "Núcleo Gestão — Cadastro de Clientes",
        description:
          "Sistema administrativo com listagem de clientes, filtros e cadastro rápido.",
        surface: "muted",
        navigationMode: "sidebar",
        density: "default",
        theme: createThemeFromPreset("default", "light", "Padrão (AccioDesign)"),
      },
    },
    content: [
      {
        type: "AppSidebar",
        props: {
          id: "AppSidebar-admin-shell",
          brandName: "Núcleo Gestão",
          brandSubtitle: "Módulo Corporativo",
          brandIcon: "building-2",
          bordered: true,
          groups: [
            {
              title: "Gestão",
              items: [
                {
                  label: "Clientes",
                  url: "#clientes",
                  icon: "users",
                  badge: "148",
                  active: true,
                },
                {
                  label: "Contratos",
                  url: "#contratos",
                  icon: "file-text",
                  badge: "24",
                  active: false,
                },
                {
                  label: "Faturamento",
                  url: "#faturamento",
                  icon: "credit-card",
                  badge: "",
                  active: false,
                },
              ],
            },
            {
              title: "Operação",
              items: [
                {
                  label: "Aprovações",
                  url: "#aprovacoes",
                  icon: "check-circle-2",
                  badge: "5",
                  active: false,
                },
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
            role: "Diretora Administrativa",
            initials: "MC",
          },
          content: [
            {
              type: "BreadcrumbNav",
              props: {
                id: "BreadcrumbNav-admin-1",
                items: [
                  { label: "Início", url: "#inicio" },
                  { label: "Gestão", url: "#gestao" },
                ],
                currentPage: "Clientes e Contratos",
                badge: {
                  label: "Competência atual",
                  url: "",
                  variant: "secondary",
                },
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "PageHeader",
              props: {
                id: "PageHeader-admin-1",
                title: "Base de Clientes",
                subtitle:
                  "Acompanhe organizações ativas, status contratual, faturamento recorrente e novos cadastros.",
                badge: {
                  label: "Operação regular",
                  url: "",
                  variant: "secondary",
                },
                actions: [
                  {
                    label: "Novo cliente",
                    url: "#cadastro-cliente",
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
                id: "Stats-admin-1",
                layout: "inline",
                statistics: [
                  {
                    label: "Empresas ativas",
                    value: "148",
                    percentage: 6.4,
                    direction: "increase",
                    polarity: "positive",
                  },
                  {
                    label: "MRR contratado",
                    value: "R$ 314.800",
                    percentage: 9.1,
                    direction: "increase",
                    polarity: "positive",
                  },
                  {
                    label: "Renovações (30d)",
                    value: "19",
                    percentage: 4.0,
                    direction: "increase",
                    polarity: "none",
                  },
                  {
                    label: "Pendências cadastrais",
                    value: "7",
                    percentage: 2.3,
                    direction: "decrease",
                    polarity: "positive",
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "FilterBar",
              props: {
                id: "FilterBar-admin-1",
                searchPlaceholder: "Buscar empresa ou CNPJ...",
                filters: [
                  { label: "Todos", active: true },
                  { label: "Ativos", active: false },
                  { label: "Em validação", active: false },
                  { label: "Renovação próxima", active: false },
                ],
                secondaryAction: {
                  label: "Filtros avançados",
                  url: "#filtros",
                  variant: "outline",
                  size: "sm",
                  icon: "filter",
                },
                primaryAction: {
                  label: "Cadastrar",
                  url: "#cadastro-cliente",
                  variant: "default",
                  size: "sm",
                  icon: "plus",
                },
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "DataTable",
              props: {
                id: "DataTable-admin-1",
                title: "Registros cadastrados",
                description:
                  "Lista consolidada de contas corporativas e vigência dos contratos.",
                caption: "Dados demonstrativos de referência administrativa.",
                showSearch: true,
                searchPlaceholder: "Filtrar registros exibidos...",
                headers: {
                  col1: "Razão Social",
                  col2: "Segmento",
                  col3: "Plano",
                  col4: "Mensalidade",
                  status: "Situação",
                },
                showColumn3: true,
                showColumn4: true,
                showStatus: true,
                rows: [
                  {
                    col1: "Horizonte Logística Ltda",
                    col2: "Transporte e Frota",
                    col3: "Enterprise",
                    col4: "R$ 6.400,00",
                    status: "Ativo",
                    statusVariant: "default",
                  },
                  {
                    col1: "Clínica Vida Integrada",
                    col2: "Saúde",
                    col3: "Corporativo",
                    col4: "R$ 3.850,00",
                    status: "Ativo",
                    statusVariant: "default",
                  },
                  {
                    col1: "Construtora Alvorada S.A.",
                    col2: "Engenharia",
                    col3: "Enterprise",
                    col4: "R$ 8.200,00",
                    status: "Em validação",
                    statusVariant: "secondary",
                  },
                  {
                    col1: "Vértice Educação Digital",
                    col2: "Ensino",
                    col3: "Essencial",
                    col4: "R$ 1.490,00",
                    status: "Ativo",
                    statusVariant: "default",
                  },
                  {
                    col1: "AgroCampos Cooperativa",
                    col2: "Agronegócio",
                    col3: "Corporativo",
                    col4: "R$ 4.100,00",
                    status: "Pendente",
                    statusVariant: "destructive",
                  },
                ],
                padding: { top: "none", bottom: "small" },
              },
            },
            {
              type: "FormBlock",
              props: {
                id: "FormBlock-admin-1",
                layout: "split",
                badge: {
                  label: "Cadastro",
                  url: "",
                  variant: "secondary",
                },
                heading: "Novo registro empresarial",
                description:
                  "Inclua rapidamente uma organização para iniciar a conferência documental e liberação do ambiente.",
                buttons: [],
                features: [
                  {
                    icon: "shield",
                    name: "Validação cadastral",
                    description:
                      "Conferência automática de domínio corporativo e dados fiscais.",
                  },
                  {
                    icon: "check",
                    name: "Provisionamento imediato",
                    description:
                      "Criação do perfil inicial após aprovação administrativa.",
                  },
                ],
                form: {
                  title: "Dados iniciais do cliente",
                  description:
                    "Preencha os campos obrigatórios para registrar a solicitação.",
                  fields: [
                    {
                      label: "Razão social",
                      type: "text",
                      name: "razaoSocial",
                      placeholder: "Ex.: Atlas Serviços Ltda",
                      required: true,
                    },
                    {
                      label: "E-mail do responsável",
                      type: "email",
                      name: "emailContato",
                      placeholder: "contato@empresa.com.br",
                      required: true,
                    },
                    {
                      label: "Observações comerciais",
                      type: "textarea",
                      name: "observacoes",
                      placeholder: "Informe o plano desejado e prazo...",
                      required: false,
                    },
                  ],
                  action: "#cadastro-enviado",
                  method: "post",
                  button: {
                    label: "Salvar cadastro",
                    variant: "default",
                    size: "default",
                    icon: "check",
                  },
                },
                padding: { top: "small", bottom: "none" },
              },
            },
          ],
        },
      },
    ],
    zones: {},
  }),
};
