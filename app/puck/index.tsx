import type { Config as PuckConfig, Data as PuckData } from "@puckeditor/core";

import Header, { type HeaderProps } from "~/puck/config/components/header";
import AppSidebar, {
  type AppSidebarProps,
} from "~/puck/config/components/app-sidebar";
import BreadcrumbNav, {
  type BreadcrumbNavProps,
} from "~/puck/config/components/breadcrumb-nav";
import Footer, { type FooterProps } from "~/puck/config/components/footer";

import PageHeader, {
  type PageHeaderProps,
} from "~/puck/config/components/page-header";
import DashboardGrid, {
  type DashboardGridProps,
} from "~/puck/config/components/dashboard-grid";
import TabsSection, {
  type TabsSectionProps,
} from "~/puck/config/components/tabs-section";
import Bento, { type BentoProps } from "~/puck/config/components/bento";
import Divider, { type DividerProps } from "~/puck/config/components/divider";
import KanbanBoard, {
  type KanbanBoardProps,
} from "~/puck/config/components/kanban-board";

import DashboardCard, {
  type DashboardCardProps,
} from "~/puck/config/components/dashboard-card";
import CardGrid, {
  type CardGridProps,
} from "~/puck/config/components/card-grid";
import UserSummaryCard, {
  type UserSummaryCardProps,
} from "~/puck/config/components/user-summary-card";

import Stats, { type StatsProps } from "~/puck/config/components/stats";
import KpiCard, { type KpiCardProps } from "~/puck/config/components/kpi-card";
import StatusBadgeGroup, {
  type StatusBadgeGroupProps,
} from "~/puck/config/components/status-badge-group";

import DataTable, {
  type DataTableProps,
} from "~/puck/config/components/data-table";
import KeyValueTable, {
  type KeyValueTableProps,
} from "~/puck/config/components/key-value-table";

import FormBlock, {
  type FormBlockProps,
} from "~/puck/config/components/form-block";
import FilterBar, {
  type FilterBarProps,
} from "~/puck/config/components/filter-bar";

import rootConfig, { type RootProps } from "~/puck/components/root";

export type Props = {
  Header: HeaderProps;
  AppSidebar: AppSidebarProps;
  BreadcrumbNav: BreadcrumbNavProps;
  Footer: FooterProps;
  PageHeader: PageHeaderProps;
  DashboardGrid: DashboardGridProps;
  TabsSection: TabsSectionProps;
  Bento: BentoProps;
  Divider: DividerProps;
  KanbanBoard: KanbanBoardProps;
  DashboardCard: DashboardCardProps;
  CardGrid: CardGridProps;
  UserSummaryCard: UserSummaryCardProps;
  Stats: StatsProps;
  KpiCard: KpiCardProps;
  StatusBadgeGroup: StatusBadgeGroupProps;
  DataTable: DataTableProps;
  KeyValueTable: KeyValueTableProps;
  FormBlock: FormBlockProps;
  FilterBar: FilterBarProps;
};

export type Config = PuckConfig<Props, RootProps>;

export const config: Config = {
  categories: {
    navegacao: {
      title: "Navegação",
      defaultExpanded: true,
      components: ["Header", "AppSidebar", "BreadcrumbNav", "Footer"],
    },
    layout: {
      title: "Layout",
      defaultExpanded: true,
      components: [
        "PageHeader",
        "DashboardGrid",
        "TabsSection",
        "Bento",
        "KanbanBoard",
        "Divider",
      ],
    },
    cards: {
      title: "Cards",
      defaultExpanded: true,
      components: ["DashboardCard", "CardGrid", "UserSummaryCard"],
    },
    indicadores: {
      title: "Indicadores",
      defaultExpanded: true,
      components: ["Stats", "KpiCard", "StatusBadgeGroup"],
    },
    tabelas: {
      title: "Tabelas",
      defaultExpanded: true,
      components: ["DataTable", "KeyValueTable"],
    },
    formularios: {
      title: "Formulários",
      defaultExpanded: true,
      components: ["FormBlock", "FilterBar"],
    },
  },
  components: {
    Header,
    AppSidebar,
    BreadcrumbNav,
    Footer,
    PageHeader,
    DashboardGrid,
    TabsSection,
    Bento,
    KanbanBoard,
    Divider,
    DashboardCard,
    CardGrid,
    UserSummaryCard,
    Stats,
    KpiCard,
    StatusBadgeGroup,
    DataTable,
    KeyValueTable,
    FormBlock,
    FilterBar,
  },
  root: rootConfig,
};

export type Data = PuckData<Props, RootProps>;

export { ErrorBoundary } from "~/puck/components/error-boundary";
export {
  EditorModeProvider,
  useIsEditorMode,
} from "~/puck/context/is-editor-mode-context";

export default config;
