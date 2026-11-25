import { useMemo, useState } from "react";
import {
  Check,
  Columns2,
  Moon,
  PanelLeft,
  PanelTop,
  RotateCcw,
  Search,
  Sun,
} from "lucide-react";
import {
  DENSITY_SPACING_MAP,
  type NavigationMode,
  type VisualDensity,
} from "~/puck/context/layout-mode-context";
import type { AccioThemeDocument } from "~/theme/schema";
import { SANS_FONT_OPTIONS } from "~/theme/tweakcn/fonts";
import { getBuiltInPresetsList } from "~/theme/tweakcn/theme-presets";
import type { ThemeMode } from "~/theme/tweakcn/types";

type ControlsTab = "temas" | "ajustes";

const RADIUS_OPTIONS = [
  { label: "Reto", value: "0rem" },
  { label: "Sutil", value: "0.375rem" },
  { label: "Padrão", value: "0.625rem" },
  { label: "Suave", value: "0.875rem" },
];

const DENSITY_OPTIONS: { label: string; value: VisualDensity }[] = [
  { label: "Compacta", value: "compact" },
  { label: "Padrão", value: "default" },
  { label: "Confortável", value: "comfortable" },
];

const NAV_OPTIONS: {
  label: string;
  value: NavigationMode;
  icon: typeof PanelLeft;
}[] = [
  { label: "Sidebar", value: "sidebar", icon: PanelLeft },
  { label: "Rail", value: "rail", icon: Columns2 },
  { label: "Topo", value: "topnav", icon: PanelTop },
];

export function PlaygroundControls({
  theme,
  navigationMode,
  density,
  supportsNavigationModes,
  onSelectPreset,
  onChangeMode,
  onChangeFontSans,
  onChangeDensity,
  onChangeRadius,
  onChangeNavigationMode,
  onResetPreset,
}: {
  theme: AccioThemeDocument;
  navigationMode: NavigationMode;
  density: VisualDensity;
  supportsNavigationModes: boolean;
  onSelectPreset: (presetId: string) => void;
  onChangeMode: (mode: ThemeMode) => void;
  onChangeFontSans: (fontValue: string) => void;
  onChangeDensity: (density: VisualDensity) => void;
  onChangeRadius: (radius: string) => void;
  onChangeNavigationMode: (mode: NavigationMode) => void;
  onResetPreset: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ControlsTab>("temas");
  const [searchQuery, setSearchQuery] = useState("");
  const presets = useMemo(() => getBuiltInPresetsList(), []);

  const filteredPresets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return presets;
    return presets.filter(
      (preset) =>
        preset.label.toLowerCase().includes(query) ||
        preset.id.toLowerCase().includes(query)
    );
  }, [presets, searchQuery]);

  const currentTokens = theme.tokens[theme.activeMode];
  const currentRadius = currentTokens.radius;
  const currentFontSans = currentTokens["font-sans"];
  const matchingFont =
    SANS_FONT_OPTIONS.find((item) => item.value === currentFontSans)?.value ??
    "__custom__";

  return (
    <aside
      aria-label="Controles de experimentação visual"
      className="flex h-full w-full shrink-0 flex-col border-r border-zinc-200 bg-white text-zinc-900 sm:w-[300px]"
    >
      {/* Seletor de abas enxuto */}
      <div className="grid grid-cols-2 gap-1 border-b border-zinc-200 bg-zinc-50/70 p-2">
        <button
          type="button"
          onClick={() => setActiveTab("temas")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "temas"
              ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Temas ({presets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ajustes")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "ajustes"
              ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Estrutura e estilo
        </button>
      </div>

      {activeTab === "temas" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-zinc-200/80 p-3">
            <label htmlFor="playground-theme-search" className="sr-only">
              Buscar identidade visual
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                id="playground-theme-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar entre 43 identidades..."
                className="h-8 w-full rounded-md border border-zinc-200 bg-zinc-50/60 pr-2.5 pl-8 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
            {filteredPresets.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-zinc-500">
                Nenhuma identidade encontrada para "{searchQuery}".
              </p>
            ) : (
              filteredPresets.map((preset) => {
                const isSelected = theme.presetId === preset.id;
                const modeStyles = preset.styles[theme.activeMode];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`preset-option-${preset.id}`}
                    onClick={() => onSelectPreset(preset.id)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900/4"
                        : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-zinc-900">
                          {preset.label}
                        </span>
                        {isSelected ? (
                          <Check className="size-3.5 shrink-0 text-zinc-900" />
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {[
                        modeStyles.background,
                        modeStyles.primary,
                        modeStyles.secondary,
                        modeStyles.accent,
                      ].map((color, idx) => (
                        <span
                          key={idx}
                          className="size-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto p-3.5">
          {/* Modo Claro / Escuro */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-zinc-700">
              Aparência
            </span>
            <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() => onChangeMode("light")}
                aria-pressed={theme.activeMode === "light"}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                  theme.activeMode === "light"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Sun className="size-3.5" />
                <span>Claro</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeMode("dark")}
                aria-pressed={theme.activeMode === "dark"}
                className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
                  theme.activeMode === "dark"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Moon className="size-3.5" />
                <span>Escuro</span>
              </button>
            </div>
          </div>

          {/* Modo de navegação (apenas templates compatíveis) */}
          {supportsNavigationModes ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700">
                  Navegação do sistema
                </span>
                <span className="text-[11px] text-zinc-500">Sem perda de dados</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {NAV_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = navigationMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      data-testid={`nav-mode-${option.value}`}
                      onClick={() => onChangeNavigationMode(option.value)}
                      aria-pressed={active}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Tipografia */}
          <div className="space-y-2">
            <label
              htmlFor="playground-font-select"
              className="block text-xs font-medium text-zinc-700"
            >
              Tipografia principal
            </label>
            <select
              id="playground-font-select"
              value={matchingFont}
              onChange={(event) => {
                if (event.target.value !== "__custom__") {
                  onChangeFontSans(event.target.value);
                }
              }}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none"
            >
              {matchingFont === "__custom__" ? (
                <option value="__custom__">Fonte do preset ({theme.name})</option>
              ) : null}
              {SANS_FONT_OPTIONS.map((font) => (
                <option key={font.family} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Densidade visual */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700">
                Densidade visual
              </span>
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                {DENSITY_SPACING_MAP[density]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DENSITY_OPTIONS.map((option) => {
                const active = density === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-testid={`density-${option.value}`}
                    onClick={() => onChangeDensity(option.value)}
                    aria-pressed={active}
                    className={`h-8 rounded-md border px-2 text-xs font-medium transition-colors ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arredondamento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700">
                Arredondamento
              </span>
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                {currentRadius}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {RADIUS_OPTIONS.map((option) => {
                const active = currentRadius === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChangeRadius(option.value)}
                    aria-pressed={active}
                    className={`h-8 rounded-md border px-1.5 text-[11px] font-medium transition-colors ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-3">
            <button
              type="button"
              onClick={onResetPreset}
              className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <RotateCcw className="size-3.5" />
              <span>Restaurar padrão do tema</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
