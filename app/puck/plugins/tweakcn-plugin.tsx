import { useEffect, type ReactNode } from "react";
import { usePuck, type Plugin } from "@puckeditor/core";
import { Moon, Palette, Sun } from "lucide-react";
import { applyThemeToDocument } from "~/theme/apply-theme";
import { normalizeThemeDocument } from "~/theme/schema";
import { TweakcnPanel, usePuckThemeState } from "./tweakcn-panel";

function ThemeIframeBridge({
  iframeDocument,
  children,
}: {
  iframeDocument?: Document;
  children: ReactNode;
}) {
  const { appState } = usePuck();
  const rawTheme = (appState.data.root?.props as { theme?: unknown } | undefined)
    ?.theme;
  const themeDoc = normalizeThemeDocument(rawTheme);

  useEffect(() => {
    if (!iframeDocument) return;
    applyThemeToDocument(themeDoc, iframeDocument);
  }, [iframeDocument, themeDoc]);

  return <>{children}</>;
}

export interface TweakcnPluginOptions {
  galleryHref?: string;
  playgroundHref?: string;
  presentHref?: string;
}

function ThemeHeaderActions({
  children,
  options,
}: {
  children: ReactNode;
  options?: TweakcnPluginOptions;
}) {
  const { theme, setTheme } = usePuckThemeState();
  const isDark = theme.activeMode === "dark";

  return (
    <>
      <div className="flex items-center gap-1.5 pr-1">
        {options?.galleryHref ? (
          <a
            href={options.galleryHref}
            className="hidden h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 lg:inline-flex"
          >
            Galeria
          </a>
        ) : null}
        {options?.playgroundHref ? (
          <a
            href={options.playgroundHref}
            className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Experimentar
          </a>
        ) : null}
        {options?.presentHref ? (
          <a
            href={options.presentHref}
            className="hidden h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
          >
            Apresentar
          </a>
        ) : null}
        <span
          className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 md:inline-flex"
          title={`Tema ativo: ${theme.name}`}
        >
          <span
            className="size-2.5 rounded-full border border-black/15"
            style={{ backgroundColor: theme.tokens[theme.activeMode].primary }}
          />
          <span className="max-w-32 truncate">{theme.name}</span>
        </span>
        <button
          type="button"
          data-testid="header-theme-mode-toggle"
          onClick={() =>
            setTheme({
              ...theme,
              activeMode: isDark ? "light" : "dark",
            })
          }
          title={isDark ? "Alternar preview para Light" : "Alternar preview para Dark"}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
        </button>
      </div>
      {children}
    </>
  );
}

export function createTweakcnPlugin(options?: TweakcnPluginOptions): Plugin {
  return {
    name: "tweakcn",
    label: "Tema",
    icon: <Palette size={18} />,
    render: () => <TweakcnPanel />,
    overrides: {
      iframe: ({ children, document }) => (
        <ThemeIframeBridge iframeDocument={document}>
          {children}
        </ThemeIframeBridge>
      ),
      headerActions: ({ children }) => (
        <ThemeHeaderActions options={options}>{children}</ThemeHeaderActions>
      ),
    },
  };
}
