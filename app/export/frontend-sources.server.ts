// Fixed catalog of reviewed presentation modules. Bundled as text in the server.
import blockAppSidebarSource from "../puck/config/components/app-sidebar/app-sidebar.tsx?raw";
import blockAreaChartSource from "../puck/config/components/area-chart/area-chart.tsx?raw";
import blockBarChartSource from "../puck/config/components/bar-chart/bar-chart.tsx?raw";
import blockBentoSource from "../puck/config/components/bento/bento.tsx?raw";
import blockBreadcrumbNavSource from "../puck/config/components/breadcrumb-nav/breadcrumb-nav.tsx?raw";
import blockCardGridSource from "../puck/config/components/card-grid/card-grid.tsx?raw";
import blockDashboardCardSource from "../puck/config/components/dashboard-card/dashboard-card.tsx?raw";
import blockDashboardGridSource from "../puck/config/components/dashboard-grid/dashboard-grid.tsx?raw";
import blockDataTableSource from "../puck/config/components/data-table/data-table.tsx?raw";
import blockDividerSource from "../puck/config/components/divider/divider.tsx?raw";
import blockDonutChartSource from "../puck/config/components/donut-chart/donut-chart.tsx?raw";
import blockFilterBarSource from "../puck/config/components/filter-bar/filter-bar.tsx?raw";
import blockFooterSource from "../puck/config/components/footer/footer.tsx?raw";
import blockFormBlockSource from "../puck/config/components/form-block/form-block.tsx?raw";
import blockHeaderSource from "../puck/config/components/header/header.tsx?raw";
import blockKanbanBoardSource from "../puck/config/components/kanban-board/kanban-board.tsx?raw";
import blockKeyValueTableSource from "../puck/config/components/key-value-table/key-value-table.tsx?raw";
import blockKpiCardSource from "../puck/config/components/kpi-card/kpi-card.tsx?raw";
import blockLineChartSource from "../puck/config/components/line-chart/line-chart.tsx?raw";
import blockPageHeaderSource from "../puck/config/components/page-header/page-header.tsx?raw";
import blockSparklineCardSource from "../puck/config/components/sparkline-card/sparkline-card.tsx?raw";
import blockStatsSource from "../puck/config/components/stats/stats.tsx?raw";
import blockStatusBadgeGroupSource from "../puck/config/components/status-badge-group/status-badge-group.tsx?raw";
import blockTabsSectionSource from "../puck/config/components/tabs-section/tabs-section.tsx?raw";
import blockUserSummaryCardSource from "../puck/config/components/user-summary-card/user-summary-card.tsx?raw";
import sharedBadgeSource from "../puck/components/badge.tsx?raw";
import sharedButtonSource from "../puck/components/button.tsx?raw";
import sharedCardSource from "../puck/components/card.tsx?raw";
import sharedChartUtilsSource from "../puck/components/chart-utils.ts?raw";
import sharedContainerSource from "../puck/components/container.tsx?raw";
import sharedContentSource from "../puck/components/content.tsx?raw";
import sharedErrorBoundarySource from "../puck/components/error-boundary.tsx?raw";
import sharedFieldSource from "../puck/components/field.tsx?raw";
import sharedFormSource from "../puck/components/form.tsx?raw";
import sharedIconSource from "../puck/components/icon.tsx?raw";
import sharedRootLayoutSource from "../puck/components/root/root-layout.tsx?raw";
import sharedVisualSlotSource from "../puck/components/visual-slot.ts?raw";
import uiAvatarSource from "../components/ui/avatar.tsx?raw";
import uiBadgeSource from "../components/ui/badge.tsx?raw";
import uiBreadcrumbSource from "../components/ui/breadcrumb.tsx?raw";
import uiButtonSource from "../components/ui/button.tsx?raw";
import uiCardSource from "../components/ui/card.tsx?raw";
import uiChartSource from "../components/ui/chart.tsx?raw";
import uiInputSource from "../components/ui/input.tsx?raw";
import uiLabelSource from "../components/ui/label.tsx?raw";
import uiNavigationMenuSource from "../components/ui/navigation-menu.tsx?raw";
import uiSeparatorSource from "../components/ui/separator.tsx?raw";
import uiSheetSource from "../components/ui/sheet.tsx?raw";
import uiSidebarSource from "../components/ui/sidebar.tsx?raw";
import uiSkeletonSource from "../components/ui/skeleton.tsx?raw";
import uiTableSource from "../components/ui/table.tsx?raw";
import uiTabsSource from "../components/ui/tabs.tsx?raw";
import uiTextareaSource from "../components/ui/textarea.tsx?raw";
import uiTooltipSource from "../components/ui/tooltip.tsx?raw";
import isEditorModeContextSource from "../puck/context/is-editor-mode-context.tsx?raw";
import visualLayoutContextSource from "../puck/context/visual-layout-context.tsx?raw";
import useMobileSource from "../hooks/use-mobile.ts?raw";
import typesSource from "../puck/types.ts?raw";
import documentSource from "./frontend/document.ts?raw";
import runtimeSource from "./frontend/runtime.tsx?raw";

export const frontendSources: Readonly<Record<string, string>> = {
  "puck/config/components/app-sidebar/app-sidebar.tsx": blockAppSidebarSource,
  "puck/config/components/area-chart/area-chart.tsx": blockAreaChartSource,
  "puck/config/components/bar-chart/bar-chart.tsx": blockBarChartSource,
  "puck/config/components/bento/bento.tsx": blockBentoSource,
  "puck/config/components/breadcrumb-nav/breadcrumb-nav.tsx": blockBreadcrumbNavSource,
  "puck/config/components/card-grid/card-grid.tsx": blockCardGridSource,
  "puck/config/components/dashboard-card/dashboard-card.tsx": blockDashboardCardSource,
  "puck/config/components/dashboard-grid/dashboard-grid.tsx": blockDashboardGridSource,
  "puck/config/components/data-table/data-table.tsx": blockDataTableSource,
  "puck/config/components/divider/divider.tsx": blockDividerSource,
  "puck/config/components/donut-chart/donut-chart.tsx": blockDonutChartSource,
  "puck/config/components/filter-bar/filter-bar.tsx": blockFilterBarSource,
  "puck/config/components/footer/footer.tsx": blockFooterSource,
  "puck/config/components/form-block/form-block.tsx": blockFormBlockSource,
  "puck/config/components/header/header.tsx": blockHeaderSource,
  "puck/config/components/kanban-board/kanban-board.tsx": blockKanbanBoardSource,
  "puck/config/components/key-value-table/key-value-table.tsx": blockKeyValueTableSource,
  "puck/config/components/kpi-card/kpi-card.tsx": blockKpiCardSource,
  "puck/config/components/line-chart/line-chart.tsx": blockLineChartSource,
  "puck/config/components/page-header/page-header.tsx": blockPageHeaderSource,
  "puck/config/components/sparkline-card/sparkline-card.tsx": blockSparklineCardSource,
  "puck/config/components/stats/stats.tsx": blockStatsSource,
  "puck/config/components/status-badge-group/status-badge-group.tsx": blockStatusBadgeGroupSource,
  "puck/config/components/tabs-section/tabs-section.tsx": blockTabsSectionSource,
  "puck/config/components/user-summary-card/user-summary-card.tsx": blockUserSummaryCardSource,
  "puck/components/badge.tsx": sharedBadgeSource,
  "puck/components/button.tsx": sharedButtonSource,
  "puck/components/card.tsx": sharedCardSource,
  "puck/components/chart-utils.ts": sharedChartUtilsSource,
  "puck/components/container.tsx": sharedContainerSource,
  "puck/components/content.tsx": sharedContentSource,
  "puck/components/error-boundary.tsx": sharedErrorBoundarySource,
  "puck/components/field.tsx": sharedFieldSource,
  "puck/components/form.tsx": sharedFormSource,
  "puck/components/icon.tsx": sharedIconSource,
  "puck/components/root/root-layout.tsx": sharedRootLayoutSource,
  "puck/components/visual-slot.ts": sharedVisualSlotSource,
  "components/ui/avatar.tsx": uiAvatarSource,
  "components/ui/badge.tsx": uiBadgeSource,
  "components/ui/breadcrumb.tsx": uiBreadcrumbSource,
  "components/ui/button.tsx": uiButtonSource,
  "components/ui/card.tsx": uiCardSource,
  "components/ui/chart.tsx": uiChartSource,
  "components/ui/input.tsx": uiInputSource,
  "components/ui/label.tsx": uiLabelSource,
  "components/ui/navigation-menu.tsx": uiNavigationMenuSource,
  "components/ui/separator.tsx": uiSeparatorSource,
  "components/ui/sheet.tsx": uiSheetSource,
  "components/ui/sidebar.tsx": uiSidebarSource,
  "components/ui/skeleton.tsx": uiSkeletonSource,
  "components/ui/table.tsx": uiTableSource,
  "components/ui/tabs.tsx": uiTabsSource,
  "components/ui/textarea.tsx": uiTextareaSource,
  "components/ui/tooltip.tsx": uiTooltipSource,
  "puck/context/is-editor-mode-context.tsx": isEditorModeContextSource,
  "puck/context/visual-layout-context.tsx": visualLayoutContextSource,
  "hooks/use-mobile.ts": useMobileSource,
  "puck/types.ts": typesSource,
  "export/frontend/document.ts": documentSource,
  "export/frontend/runtime.tsx": runtimeSource,
};
