import { useEffect, useMemo, useState } from "react";
import { usePuck, type RootData } from "@puckeditor/core";
import {
  Check,
  Copy,
  Download,
  Moon,
  RotateCcw,
  Save,
  Search,
  Shuffle,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import type { Config } from "~/puck";
import {
  createThemeFromPreset,
  normalizeThemeDocument,
  parseImportedThemeJson,
  type AccioThemeDocument,
} from "~/theme/schema";
import {
  deleteSavedTheme,
  loadSavedThemes,
  saveThemeSnapshot,
} from "~/theme/storage";
import { colorToHex } from "~/theme/tweakcn/color-converter";
import { COMMON_STYLES } from "~/theme/tweakcn/defaults";
import { generateThemeCode } from "~/theme/tweakcn/css-generator";
import {
  MONO_FONT_OPTIONS,
  SANS_FONT_OPTIONS,
  SERIF_FONT_OPTIONS,
} from "~/theme/tweakcn/fonts";
import { getBuiltInPresetsList } from "~/theme/tweakcn/theme-presets";
import type {
  ColorFormat,
  ThemeMode,
  ThemeStyleKey,
  ThemeStyleProps,
} from "~/theme/tweakcn/types";

type PanelTab = "presets" | "colors" | "style" | "export";

interface ColorEntry {
  key: keyof ThemeStyleProps;
  label: string;
}

interface ColorGroup {
  title: string;
  defaultOpen?: boolean;
  colors: ColorEntry[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Primária & Secundária",
    defaultOpen: true,
    colors: [
      { key: "primary", label: "Primary" },
      { key: "primary-foreground", label: "Primary FG" },
      { key: "secondary", label: "Secondary" },
      { key: "secondary-foreground", label: "Secondary FG" },
    ],
  },
  {
    title: "Superfícies & Texto",
    defaultOpen: true,
    colors: [
      { key: "background", label: "Background" },
      { key: "foreground", label: "Foreground" },
      { key: "card", label: "Card" },
      { key: "card-foreground", label: "Card FG" },
      { key: "popover", label: "Popover" },
      { key: "popover-foreground", label: "Popover FG" },
    ],
  },
  {
    title: "Destaque & Estado",
    colors: [
      { key: "accent", label: "Accent" },
      { key: "accent-foreground", label: "Accent FG" },
      { key: "muted", label: "Muted" },
      { key: "muted-foreground", label: "Muted FG" },
      { key: "destructive", label: "Destructive" },
      { key: "destructive-foreground", label: "Destructive FG" },
    ],
  },
  {
    title: "Bordas & Campos",
    colors: [
      { key: "border", label: "Border" },
      { key: "input", label: "Input" },
      { key: "ring", label: "Ring" },
    ],
  },
  {
    title: "Gráficos (Charts)",
    colors: [
      { key: "chart-1", label: "Chart 1" },
      { key: "chart-2", label: "Chart 2" },
      { key: "chart-3", label: "Chart 3" },
      { key: "chart-4", label: "Chart 4" },
      { key: "chart-5", label: "Chart 5" },
    ],
  },
  {
    title: "Sidebar",
    colors: [
      { key: "sidebar", label: "Sidebar BG" },
      { key: "sidebar-foreground", label: "Sidebar FG" },
      { key: "sidebar-primary", label: "Sidebar Primary" },
      { key: "sidebar-primary-foreground", label: "Sidebar Primary FG" },
      { key: "sidebar-accent", label: "Sidebar Accent" },
      { key: "sidebar-accent-foreground", label: "Sidebar Accent FG" },
      { key: "sidebar-border", label: "Sidebar Border" },
      { key: "sidebar-ring", label: "Sidebar Ring" },
    ],
  },
];

const COMMON_STYLE_SET = new Set<string>(COMMON_STYLES);

function parseUnitNumber(raw: string | undefined, unit: string, fallback: number): number {
  if (!raw) return fallback;
  const num = parseFloat(raw.replace(unit, ""));
  return Number.isFinite(num) ? num : fallback;
}

export function usePuckThemeState() {
  const { appState, dispatch } = usePuck<Config>();
  const currentRoot = appState.data.root;
  const rawTheme = currentRoot?.props?.theme;
  const theme = useMemo(() => normalizeThemeDocument(rawTheme), [rawTheme]);

  const setTheme = (nextTheme: AccioThemeDocument) => {
    const normalized = normalizeThemeDocument({
      ...nextTheme,
      updatedAt: new Date().toISOString(),
    });
    dispatch({
      type: "replaceRoot",
      recordHistory: true,
      root: {
        ...currentRoot,
        props: {
          title: currentRoot?.props?.title ?? "AccioDesign",
          ...(currentRoot?.props ?? {}),
          theme: normalized,
        },
      } as RootData,
    });
  };

  return { theme, setTheme };
}

export function TweakcnPanel() {
  const { theme, setTheme } = usePuckThemeState();
  const [activeTab, setActiveTab] = useState<PanelTab>("presets");
  const [presetQuery, setPresetQuery] = useState("");
  const [colorQuery, setColorQuery] = useState("");
  const [savedThemes, setSavedThemes] = useState<AccioThemeDocument[]>([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [exportKind, setExportKind] = useState<"json" | "css">("json");
  const [cssFormat, setCssFormat] = useState<ColorFormat>("oklch");
  const [importText, setImportText] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSavedThemes(loadSavedThemes());
  }, []);

  const allPresets = useMemo(() => getBuiltInPresetsList(), []);
  const mode: ThemeMode = theme.activeMode;
  const currentTokens = theme.tokens[mode];

  const filteredPresets = useMemo(() => {
    const q = presetQuery.trim().toLowerCase();
    if (!q) return allPresets;
    return allPresets.filter(
      (preset) =>
        preset.label.toLowerCase().includes(q) ||
        preset.id.toLowerCase().includes(q)
    );
  }, [allPresets, presetQuery]);

  const filteredColorGroups = useMemo(() => {
    const q = colorQuery.trim().toLowerCase();
    if (!q) return COLOR_GROUPS;
    return COLOR_GROUPS.map((group) => ({
      ...group,
      defaultOpen: true,
      colors: group.colors.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.key.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q)
      ),
    })).filter((group) => group.colors.length > 0);
  }, [colorQuery]);

  const applyPreset = (presetId: string) => {
    const next = createThemeFromPreset(presetId, mode);
    setTheme(next);
    setFeedback(null);
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setTheme({
      ...theme,
      activeMode: nextMode,
    });
  };

  const randomizePreset = () => {
    const random = allPresets[Math.floor(Math.random() * allPresets.length)];
    if (random) {
      applyPreset(random.id);
    }
  };

  const restorePresetDefaults = () => {
    setTheme(createThemeFromPreset(theme.presetId, mode));
    setFeedback({
      type: "ok",
      text: "Tokens restaurados para o padrão do preset atual.",
    });
  };

  const updateToken = (key: ThemeStyleKey, value: string) => {
    if (COMMON_STYLE_SET.has(key)) {
      setTheme({
        ...theme,
        tokens: {
          light: { ...theme.tokens.light, [key]: value },
          dark: { ...theme.tokens.dark, [key]: value },
        },
      });
      return;
    }

    setTheme({
      ...theme,
      tokens: {
        ...theme.tokens,
        [mode]: {
          ...theme.tokens[mode],
          [key]: value,
        },
      },
    });
  };

  const handleSaveSnapshot = () => {
    const label = snapshotName.trim() || `${theme.name} (${mode})`;
    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 32);
    const snapshot: AccioThemeDocument = {
      ...theme,
      id: `saved-${slug || "tema"}-${Date.now().toString(36)}`,
      name: label,
      updatedAt: new Date().toISOString(),
    };
    const next = saveThemeSnapshot(snapshot);
    setSavedThemes(next);
    setSnapshotName("");
    setFeedback({
      type: "ok",
      text: `Tema "${label}" salvo localmente.`,
    });
  };

  const handleDeleteSnapshot = (id: string) => {
    const next = deleteSavedTheme(id);
    setSavedThemes(next);
  };

  const exportOutput = useMemo(() => {
    if (exportKind === "json") {
      return JSON.stringify(theme, null, 2);
    }
    return generateThemeCode(theme.tokens, cssFormat);
  }, [exportKind, theme, cssFormat]);

  const handleCopyExport = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(exportOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadExport = () => {
    if (typeof document === "undefined") return;
    const ext = exportKind === "json" ? "json" : "css";
    const mime = exportKind === "json" ? "application/json" : "text/css";
    const blob = new Blob([exportOutput], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${theme.presetId || "acciodesign-theme"}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    const result = parseImportedThemeJson(importText);
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setTheme(result.theme);
    setImportText("");
    setFeedback({
      type: "ok",
      text: `Tema "${result.theme.name}" importado e aplicado com segurança.`,
    });
  };

  const radiusRem = parseUnitNumber(currentTokens.radius, "rem", 0.625);
  const spacingRem = parseUnitNumber(currentTokens.spacing, "rem", 0.25);
  const trackingEm = parseUnitNumber(currentTokens["letter-spacing"], "em", 0);
  const shadowOpacity = Number.isFinite(parseFloat(currentTokens["shadow-opacity"]))
    ? parseFloat(currentTokens["shadow-opacity"])
    : 0.1;
  const shadowBlur = parseUnitNumber(currentTokens["shadow-blur"], "px", 3);
  const shadowSpread = parseUnitNumber(currentTokens["shadow-spread"], "px", 0);
  const shadowOffsetX = parseUnitNumber(currentTokens["shadow-offset-x"], "px", 0);
  const shadowOffsetY = parseUnitNumber(currentTokens["shadow-offset-y"], "px", 1);

  return (
    <div
      className="flex h-full flex-col bg-white text-slate-900 select-none"
      data-testid="tweakcn-panel"
    >
      {/* Cabeçalho compacto de identidade visual */}
      <div className="flex flex-col gap-2.5 border-b border-slate-200 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              Provador Tweakcn
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {theme.name}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMode}
              title={mode === "dark" ? "Mudar para Light" : "Mudar para Dark"}
              data-testid="tweakcn-mode-toggle"
              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {mode === "dark" ? (
                <>
                  <Moon className="size-3.5" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="size-3.5" />
                  <span>Light</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={randomizePreset}
              title="Preset aleatório"
              className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            >
              <Shuffle className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={restorePresetDefaults}
              title="Restaurar tokens do preset"
              className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-abas */}
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              { id: "presets", label: "Presets" },
              { id: "colors", label: "Cores" },
              { id: "style", label: "Estilo" },
              { id: "export", label: "Salvar" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`tweakcn-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback ? (
        <div
          className={`mx-3.5 mt-2.5 rounded-md border px-2.5 py-2 text-xs ${
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {/* Conteúdo rolável */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3">
        {activeTab === "presets" ? (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={presetQuery}
                onChange={(e) => setPresetQuery(e.target.value)}
                placeholder="Buscar entre 43 presets..."
                className="h-8 w-full rounded-md border border-slate-200 bg-white pr-2.5 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            {savedThemes.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Temas salvos ({savedThemes.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {savedThemes.map((saved) => {
                    const tokens = saved.tokens[saved.activeMode];
                    return (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-2"
                      >
                        <button
                          type="button"
                          onClick={() => setTheme(saved)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <div className="flex shrink-0 -space-x-1">
                            {[
                              tokens.primary,
                              tokens.accent,
                              tokens.secondary,
                              tokens.background,
                            ].map((c, idx) => (
                              <span
                                key={idx}
                                className="size-3.5 rounded-full border border-black/15"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <span className="truncate text-xs font-medium text-slate-800">
                            {saved.name}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSnapshot(saved.id)}
                          title="Remover tema salvo"
                          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Catálogo Tweakcn ({filteredPresets.length})
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {filteredPresets.map((preset) => {
                  const previewTokens = preset.styles[mode];
                  const isActive = theme.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`preset-card-${preset.id}`}
                      onClick={() => applyPreset(preset.id)}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? "border-slate-900 bg-slate-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex shrink-0 items-center gap-0.5">
                          {[
                            previewTokens.primary,
                            previewTokens.accent,
                            previewTokens.secondary,
                            previewTokens.background,
                          ].map((swatch, idx) => (
                            <span
                              key={idx}
                              className="size-3.5 rounded-sm border border-black/15"
                              style={{ backgroundColor: swatch }}
                            />
                          ))}
                        </div>
                        <span className="truncate text-xs font-medium text-slate-900">
                          {preset.label}
                        </span>
                      </div>
                      {isActive ? (
                        <Check className="size-3.5 shrink-0 text-slate-900" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "colors" ? (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={colorQuery}
                onChange={(e) => setColorQuery(e.target.value)}
                placeholder="Filtrar tokens de cor..."
                className="h-8 w-full rounded-md border border-slate-200 bg-white pr-2.5 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            {filteredColorGroups.map((group) => (
              <details
                key={group.title}
                open={group.defaultOpen}
                className="rounded-lg border border-slate-200 bg-white"
              >
                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-800 select-none">
                  {group.title}
                </summary>
                <div className="flex flex-col gap-2 border-t border-slate-100 p-2.5">
                  {group.colors.map((entry) => {
                    const value = currentTokens[entry.key] || "#000000";
                    const hexValue = colorToHex(value);
                    return (
                      <div
                        key={entry.key}
                        className="flex items-center justify-between gap-2"
                      >
                        <label
                          htmlFor={`color-${entry.key}`}
                          className="truncate text-[11px] font-medium text-slate-600"
                        >
                          {entry.label}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id={`color-${entry.key}`}
                            data-testid={`color-picker-${entry.key}`}
                            type="color"
                            value={hexValue}
                            onChange={(e) => updateToken(entry.key, e.target.value)}
                            className="h-6 w-7 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateToken(entry.key, e.target.value)}
                            className="h-6 w-28 rounded border border-slate-200 px-1.5 font-mono text-[11px] text-slate-800 focus:border-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        ) : null}

        {activeTab === "style" ? (
          <div className="flex flex-col gap-4">
            {/* Tipografia */}
            <section className="flex flex-col gap-2.5 rounded-lg border border-slate-200 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Tipografia
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-600">
                  Fonte Sans-Serif
                </label>
                <select
                  data-testid="font-sans-select"
                  value={currentTokens["font-sans"]}
                  onChange={(e) => updateToken("font-sans", e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900"
                >
                  {!SANS_FONT_OPTIONS.some(
                    (opt) => opt.value === currentTokens["font-sans"]
                  ) ? (
                    <option value={currentTokens["font-sans"]}>
                      Atual ({currentTokens["font-sans"].split(",")[0]})
                    </option>
                  ) : null}
                  {SANS_FONT_OPTIONS.map((opt) => (
                    <option key={opt.family} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-600">
                  Fonte Serif
                </label>
                <select
                  value={currentTokens["font-serif"]}
                  onChange={(e) => updateToken("font-serif", e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900"
                >
                  {!SERIF_FONT_OPTIONS.some(
                    (opt) => opt.value === currentTokens["font-serif"]
                  ) ? (
                    <option value={currentTokens["font-serif"]}>
                      Atual ({currentTokens["font-serif"].split(",")[0]})
                    </option>
                  ) : null}
                  {SERIF_FONT_OPTIONS.map((opt) => (
                    <option key={opt.family} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-600">
                  Fonte Monospace
                </label>
                <select
                  value={currentTokens["font-mono"]}
                  onChange={(e) => updateToken("font-mono", e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900"
                >
                  {!MONO_FONT_OPTIONS.some(
                    (opt) => opt.value === currentTokens["font-mono"]
                  ) ? (
                    <option value={currentTokens["font-mono"]}>
                      Atual ({currentTokens["font-mono"].split(",")[0]})
                    </option>
                  ) : null}
                  {MONO_FONT_OPTIONS.map((opt) => (
                    <option key={opt.family} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600">
                    Espaçamento entre letras
                  </span>
                  <span className="font-mono text-slate-700">
                    {trackingEm}em
                  </span>
                </div>
                <input
                  type="range"
                  min={-0.05}
                  max={0.15}
                  step={0.005}
                  value={trackingEm}
                  onChange={(e) =>
                    updateToken("letter-spacing", `${e.target.value}em`)
                  }
                  className="w-full accent-slate-900"
                />
              </div>
            </section>

            {/* Bordas & Espaçamento */}
            <section className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Bordas e Espaçamento
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600">
                    Arredondamento (radius)
                  </span>
                  <span className="font-mono text-slate-700">
                    {radiusRem}rem
                  </span>
                </div>
                <input
                  data-testid="radius-slider"
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.025}
                  value={radiusRem}
                  onChange={(e) => updateToken("radius", `${e.target.value}rem`)}
                  className="w-full accent-slate-900"
                />
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {["0rem", "0.375rem", "0.625rem", "1rem"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateToken("radius", val)}
                      className={`rounded border px-1.5 py-1 font-mono text-[10px] ${
                        currentTokens.radius === val
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600">
                    Escala de espaçamento
                  </span>
                  <span className="font-mono text-slate-700">
                    {spacingRem}rem
                  </span>
                </div>
                <input
                  type="range"
                  min={0.18}
                  max={0.32}
                  step={0.01}
                  value={spacingRem}
                  onChange={(e) => updateToken("spacing", `${e.target.value}rem`)}
                  className="w-full accent-slate-900"
                />
              </div>
            </section>

            {/* Sombras */}
            <section className="flex flex-col gap-2.5 rounded-lg border border-slate-200 p-3">
              <h3 className="text-xs font-semibold text-slate-800">Sombras</h3>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-600">
                  Cor da sombra
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={colorToHex(currentTokens["shadow-color"])}
                    onChange={(e) => updateToken("shadow-color", e.target.value)}
                    className="h-6 w-7 cursor-pointer rounded border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={currentTokens["shadow-color"]}
                    onChange={(e) => updateToken("shadow-color", e.target.value)}
                    className="h-6 w-28 rounded border border-slate-200 px-1.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              {(
                [
                  {
                    key: "shadow-opacity",
                    label: "Opacidade",
                    value: shadowOpacity,
                    min: 0,
                    max: 1,
                    step: 0.02,
                    unit: "",
                  },
                  {
                    key: "shadow-blur",
                    label: "Desfoque (blur)",
                    value: shadowBlur,
                    min: 0,
                    max: 32,
                    step: 0.5,
                    unit: "px",
                  },
                  {
                    key: "shadow-spread",
                    label: "Expansão (spread)",
                    value: shadowSpread,
                    min: -12,
                    max: 12,
                    step: 0.5,
                    unit: "px",
                  },
                  {
                    key: "shadow-offset-x",
                    label: "Deslocamento X",
                    value: shadowOffsetX,
                    min: -12,
                    max: 12,
                    step: 0.5,
                    unit: "px",
                  },
                  {
                    key: "shadow-offset-y",
                    label: "Deslocamento Y",
                    value: shadowOffsetY,
                    min: -12,
                    max: 24,
                    step: 0.5,
                    unit: "px",
                  },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-600">
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-700">
                      {item.value}
                      {item.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={item.value}
                    onChange={(e) =>
                      updateToken(item.key, `${e.target.value}${item.unit}`)
                    }
                    className="w-full accent-slate-900"
                  />
                </div>
              ))}
            </section>
          </div>
        ) : null}

        {activeTab === "export" ? (
          <div className="flex flex-col gap-3.5">
            {/* Salvar snapshot local */}
            <section className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Salvar tema localmente
              </h3>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  data-testid="snapshot-name-input"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  placeholder="Nome da identidade visual..."
                  className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  data-testid="save-snapshot-btn"
                  onClick={handleSaveSnapshot}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  <Save className="size-3.5" />
                  <span>Salvar</span>
                </button>
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={restorePresetDefaults}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="size-3" />
                  <span>Restaurar preset</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTheme(createThemeFromPreset("default", "light"))
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Padrão inicial</span>
                </button>
              </div>
            </section>

            {/* Exportar JSON / CSS */}
            <section className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-slate-800">
                  Exportar configuração
                </h3>
                <div className="flex rounded-md border border-slate-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setExportKind("json")}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                      exportKind === "json"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportKind("css")}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                      exportKind === "css"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    CSS v4
                  </button>
                </div>
              </div>

              {exportKind === "css" ? (
                <select
                  value={cssFormat}
                  onChange={(e) => setCssFormat(e.target.value as ColorFormat)}
                  className="h-7 rounded border border-slate-200 bg-white px-2 text-[11px]"
                >
                  <option value="oklch">Formato: OKLCH (Tailwind v4)</option>
                  <option value="hsl">Formato: HSL</option>
                  <option value="hex">Formato: HEX</option>
                  <option value="rgb">Formato: RGB</option>
                </select>
              ) : null}

              <pre className="max-h-44 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 font-mono text-[10px] leading-relaxed text-slate-800">
                {exportOutput}
              </pre>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadExport}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="size-3.5" />
                  <span>Baixar</span>
                </button>
              </div>
            </section>

            {/* Importar JSON */}
            <section className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Importar JSON estruturado
              </h3>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Cole aqui um JSON com "schemaVersion": "1.0" e "tokens": { "light": ..., "dark": ... }'
                className="w-full rounded-md border border-slate-200 p-2 font-mono text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleImportJson}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                <Upload className="size-3.5" />
                <span>Validar e aplicar JSON</span>
              </button>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
