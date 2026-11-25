import { useRef, useState } from "react";
import { Link, useNavigate, useRevalidator } from "react-router";
import type { Data } from "@puckeditor/core";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Monitor,
  Moon,
  Pencil,
  Save,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Tablet,
} from "lucide-react";
import type { Route } from "./+types/play.$projectId";
import { PlaygroundControls } from "~/components/playground/playground-sidebar";
import {
  PlaygroundPreviewFrame,
  type PreviewViewport,
} from "~/components/playground/preview-frame";
import {
  getProject,
  saveProject,
  type LocalProject,
} from "~/lib/projects.server";
import type { Data as AppData } from "~/puck";
import type { RootProps } from "~/puck/components/root";
import {
  applyDensityToTheme,
  applyFontSansToTheme,
  applyRadiusToTheme,
  detectDensityFromTheme,
  hasNavigationShell,
  normalizeNavigationMode,
  normalizeVisualDensity,
  type NavigationMode,
  type VisualDensity,
} from "~/puck/context/layout-mode-context";
import {
  createThemeFromPreset,
  normalizeThemeDocument,
  type AccioThemeDocument,
} from "~/theme/schema";
import { useUnsavedChanges } from "~/hooks/use-unsaved-changes";
import type { ThemeMode } from "~/theme/tweakcn/types";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProject(params.projectId);
  if (!project) {
    throw new Response("Projeto não encontrado", { status: 404 });
  }
  return { project };
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.project?.name ?? "Experimentar";
  return [{ title: `${title} — Experimentar · AccioDesign` }];
}

export async function action({ params, request }: Route.ActionArgs) {
  const body = (await request.json()) as { name?: string; data?: Data };
  const updated = await saveProject(params.projectId, {
    name: body.name,
    data: body.data as AppData | undefined,
  });

  if (!updated) {
    throw new Response("Projeto não encontrado", { status: 404 });
  }

  return { ok: true, project: updated };
}

function PlayProjectWorkspace({ project }: { project: LocalProject }) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [projectName, setProjectName] = useState(project.name);
  const [docData, setDocData] = useState<AppData>(project.data);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [controlsOpen, setControlsOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const revision = useRef(0);
  const saving = useRef(false);
  const bypassNavigation = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useUnsavedChanges(hasUnsavedChanges, bypassNavigation);

  const rootProps = (docData.root?.props ?? {}) as Partial<RootProps>;
  const themeDoc = normalizeThemeDocument(rootProps.theme);
  const navigationMode = normalizeNavigationMode(rootProps.navigationMode);
  const density = rootProps.density
    ? normalizeVisualDensity(rootProps.density)
    : detectDensityFromTheme(themeDoc);
  const supportsNav = hasNavigationShell(docData);

  const updateRootProps = (
    updater: (prev: RootProps) => Partial<RootProps>
  ) => {
    setDocData((prev) => {
      const prevRootProps = (prev.root?.props ?? {}) as RootProps;
      return {
        ...prev,
        root: {
          ...prev.root,
          props: {
            ...prevRootProps,
            ...updater(prevRootProps),
          },
        },
      };
    });
    revision.current++;
    setHasUnsavedChanges(true);
    setSaveError(null);
  };

  const updateTheme = (nextTheme: AccioThemeDocument) => {
    updateRootProps(() => ({ theme: nextTheme }));
  };

  const handleSelectPreset = (presetId: string) => {
    const freshTheme = createThemeFromPreset(presetId, themeDoc.activeMode);
    updateRootProps(() => ({
      theme: freshTheme,
      density: detectDensityFromTheme(freshTheme),
    }));
  };

  const handleChangeMode = (mode: ThemeMode) => {
    updateTheme({
      ...themeDoc,
      activeMode: mode,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleChangeFontSans = (fontValue: string) => {
    updateTheme(applyFontSansToTheme(themeDoc, fontValue));
  };

  const handleChangeDensity = (nextDensity: VisualDensity) => {
    updateRootProps(() => ({
      density: nextDensity,
      theme: applyDensityToTheme(themeDoc, nextDensity),
    }));
  };

  const handleChangeRadius = (radius: string) => {
    updateTheme(applyRadiusToTheme(themeDoc, radius));
  };

  const handleChangeNavigationMode = (mode: NavigationMode) => {
    updateRootProps(() => ({ navigationMode: mode }));
  };

  const handleResetPreset = () => {
    const reset = createThemeFromPreset(themeDoc.presetId, themeDoc.activeMode);
    updateRootProps(() => ({
      theme: reset,
      density: detectDensityFromTheme(reset),
    }));
  };

  const persistNow = async (): Promise<number | null> => {
    if (saving.current) return null;
    saving.current = true;
    const savedRevision = revision.current;
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/play/${project.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          data: docData,
        }),
      });
      if (!response.ok) {
        setSaveError("Não foi possível salvar as alterações locais.");
        return null;
      }
      await revalidator.revalidate();
      if (revision.current !== savedRevision) return null;
      setHasUnsavedChanges(false);
      return savedRevision;
    } catch {
      setSaveError("Erro ao comunicar com o servidor local ao salvar.");
      return null;
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };


  const handleNavigateSaving = async (targetPath: string) => {
    const savedRevision = hasUnsavedChanges ? await persistNow() : revision.current;
    if (savedRevision === null || revision.current !== savedRevision) return;
    bypassNavigation.current = true;
    navigate(targetPath);
    bypassNavigation.current = false;
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-zinc-900">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Galeria</span>
          </Link>

          <button
            type="button"
            data-testid="playground-toggle-controls"
            onClick={() => setControlsOpen((prev) => !prev)}
            aria-expanded={controlsOpen}
            title={
              controlsOpen ? "Recolher painel de temas" : "Abrir painel de temas"
            }
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors ${
              controlsOpen
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden md:inline">Ajustes</span>
          </button>

          <label htmlFor="playground-project-name" className="sr-only">
            Nome do projeto
          </label>
          <input
            id="playground-project-name"
            type="text"
            value={projectName}
            onChange={(event) => {
              revision.current++;
              setProjectName(event.target.value);
              setHasUnsavedChanges(true);
            }}
            className="h-8 w-24 min-w-0 truncate rounded-md border border-transparent px-2 text-sm font-medium text-zinc-900 hover:border-zinc-200 focus:border-zinc-300 focus:bg-zinc-50 focus:outline-none sm:w-40 lg:w-52"
          />
        </div>

        {/* Seletor de viewport */}
        <div
          role="group"
          aria-label="Tamanho da tela"
          className="hidden items-center gap-1 rounded-lg bg-zinc-100 p-1 sm:flex"
        >
          {[
            { id: "desktop" as const, label: "Desktop", icon: Monitor },
            { id: "tablet" as const, label: "Tablet", icon: Tablet },
            { id: "mobile" as const, label: "Mobile", icon: Smartphone },
          ].map((item) => {
            const Icon = item.icon;
            const active = viewport === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`viewport-${item.id}`}
                onClick={() => setViewport(item.id)}
                aria-pressed={active}
                className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors lg:px-2.5 ${
                  active
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            data-testid="playground-mode-toggle"
            onClick={() =>
              handleChangeMode(themeDoc.activeMode === "dark" ? "light" : "dark")
            }
            title={
              themeDoc.activeMode === "dark"
                ? "Alternar preview para Claro"
                : "Alternar preview para Escuro"
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {themeDoc.activeMode === "dark" ? (
              <Moon className="size-3.5" />
            ) : (
              <Sun className="size-3.5" />
            )}
            <span className="hidden xl:inline">
              {themeDoc.activeMode === "dark" ? "Escuro" : "Claro"}
            </span>
          </button>

          <button
            type="button"
            data-testid="playground-save-button"
            onClick={() => {
              void persistNow();
            }}
            disabled={isSaving}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
              hasUnsavedChanges
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {hasUnsavedChanges ? (
              <Save className="size-3.5" />
            ) : (
              <Check className="size-3.5" />
            )}
            <span>
              {isSaving
                ? "Salvando..."
                : hasUnsavedChanges
                  ? "Salvar"
                  : "Salvo"}
            </span>
          </button>

          <button
            type="button"
            data-testid="playground-edit-link"
            onClick={() => {
              void handleNavigateSaving(`/projects/${project.id}/edit`);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Pencil className="size-3.5" />
            <span className="hidden md:inline">Editar estrutura</span>
          </button>

          <button
            type="button"
            data-testid="playground-present-link"
            onClick={() => {
              void handleNavigateSaving(`/projects/${project.id}`);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden md:inline">Apresentar</span>
          </button>
        </div>
      </header>

      {saveError ? (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700"
        >
          {saveError}
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {controlsOpen ? (
          <div className="absolute inset-y-0 left-0 z-20 flex max-w-full shadow-lg sm:static sm:z-auto sm:shadow-none">
            <PlaygroundControls
              theme={themeDoc}
              navigationMode={navigationMode}
              density={density}
              supportsNavigationModes={supportsNav}
              onSelectPreset={handleSelectPreset}
              onChangeMode={handleChangeMode}
              onChangeFontSans={handleChangeFontSans}
              onChangeDensity={handleChangeDensity}
              onChangeRadius={handleChangeRadius}
              onChangeNavigationMode={handleChangeNavigationMode}
              onResetPreset={handleResetPreset}
            />
          </div>
        ) : null}

        <PlaygroundPreviewFrame data={docData} viewport={viewport} />
      </div>
    </div>
  );
}

export default function PlayProjectRoute({ loaderData }: Route.ComponentProps) {
  return (
    <PlayProjectWorkspace
      key={loaderData.project.id}
      project={loaderData.project}
    />
  );
}
