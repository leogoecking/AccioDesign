import { useEffect } from "react";
import type { RootConfig } from "@puckeditor/core";
import { LayoutWidthField } from "~/components/layout-width-field";
import type { LayoutWidth } from "~/puck/context/visual-layout-context";
import { RootLayout } from "./root-layout";
import { useIsEditorMode } from "~/puck/context/is-editor-mode-context";
import type {
  NavigationMode,
  VisualDensity,
} from "~/puck/context/layout-mode-context";
import {
  applyThemeToDocument,
  buildThemeCssText,
  clearThemeFromDocument,
} from "~/theme/apply-theme";
import {
  createThemeFromPreset,
  normalizeThemeDocument,
  type AccioThemeDocument,
} from "~/theme/schema";
import { getThemeGoogleFontUrls } from "~/theme/tweakcn/fonts";

export type RootProps = {
  title: string;
  description?: string;
  surface?: "default" | "muted";
  navigationMode?: NavigationMode;
  density?: VisualDensity;
  theme?: AccioThemeDocument;
  layoutWidth?: LayoutWidth;
};

const RootRenderer = ({
  children,
  surface = "muted",
  navigationMode = "sidebar",
  density = "default",
  theme,
  layoutWidth,
}: {
  children: React.ReactNode;
  surface?: "default" | "muted";
  navigationMode?: NavigationMode;
  density?: VisualDensity;
  theme?: AccioThemeDocument;
  layoutWidth?: LayoutWidth;
}) => {
  const isEditorMode = useIsEditorMode();
  const themeDoc = normalizeThemeDocument(theme);
  const mode = themeDoc.activeMode;
  const googleFontUrls = getThemeGoogleFontUrls(themeDoc.tokens[mode]);

  useEffect(() => {
    if (isEditorMode || typeof document === "undefined") {
      return;
    }

    applyThemeToDocument(themeDoc, document);
    return () => {
      clearThemeFromDocument(document);
    };
  }, [isEditorMode, themeDoc]);

  return (
    <>
      {!isEditorMode ? (
        <>
          <style
            id="accio-published-theme"
            dangerouslySetInnerHTML={{
              __html: buildThemeCssText(themeDoc, {
                includeRoot: true,
                scopeSelector: "[data-accio-theme]",
              }),
            }}
          />
          {googleFontUrls.map((url) => (
            <link
              key={url}
              rel="stylesheet"
              href={url}
              data-accio-font="true"
            />
          ))}
        </>
      ) : null}
      <RootLayout
        surface={surface}
        navigationMode={navigationMode}
        density={density}
        mode={mode}
        presetId={themeDoc.presetId}
        layoutWidth={layoutWidth}
      >
        {children}
      </RootLayout>
    </>
  );
};

const rootConfig: RootConfig<RootProps> = {
  fields: {
    title: {
      type: "text",
      label: "Título da página",
    },
    description: {
      type: "textarea",
      label: "Descrição",
    },
    surface: {
      type: "radio",
      label: "Fundo da página",
      options: [
        { label: "Padrão", value: "default" },
        { label: "Sutil", value: "muted" },
      ],
    },
    layoutWidth: {
      type: "custom",
      label: "Largura do conteúdo",
      render: ({ value, onChange, readOnly }) => (
        <LayoutWidthField value={value} onChange={onChange} readOnly={readOnly} />
      ),
    },
    navigationMode: {
      type: "radio",
      label: "Modo de navegação",
      options: [
        { label: "Sidebar", value: "sidebar" },
        { label: "Rail compacto", value: "rail" },
        { label: "Menu superior", value: "topnav" },
      ],
    },
  },
  defaultProps: {
    title: "AccioDesign — Painel Operacional",
    description: "Laboratório visual de interfaces administrativas",
    surface: "muted",
    navigationMode: "sidebar",
    density: "default",
    theme: createThemeFromPreset("default", "light"),
  },
  render: ({ children, surface, navigationMode, density, theme, layoutWidth }) => (
    <RootRenderer
      surface={surface}
      navigationMode={navigationMode}
      density={density}
      theme={theme}
      layoutWidth={layoutWidth}
    >
      {children}
    </RootRenderer>
  ),
};

export default rootConfig;
