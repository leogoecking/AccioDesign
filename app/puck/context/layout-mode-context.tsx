import { normalizeThemeDocument, type AccioThemeDocument } from "~/theme/schema";
import type { VisualDensity } from "./visual-layout-context";

export * from "./visual-layout-context";

export const DENSITY_SPACING_MAP: Record<VisualDensity, string> = {
  compact: "0.21rem",
  default: "0.25rem",
  comfortable: "0.29rem",
};

export function detectDensityFromTheme(
  inputTheme: AccioThemeDocument | unknown
): VisualDensity {
  const theme = normalizeThemeDocument(inputTheme);
  const spacing = theme.tokens[theme.activeMode].spacing;
  if (spacing === DENSITY_SPACING_MAP.compact) return "compact";
  if (spacing === DENSITY_SPACING_MAP.comfortable) return "comfortable";
  return "default";
}

export function applyDensityToTheme(
  inputTheme: AccioThemeDocument,
  density: VisualDensity
): AccioThemeDocument {
  const spacing = DENSITY_SPACING_MAP[density];
  return {
    ...inputTheme,
    updatedAt: new Date().toISOString(),
    tokens: {
      light: {
        ...inputTheme.tokens.light,
        spacing,
      },
      dark: {
        ...inputTheme.tokens.dark,
        spacing,
      },
    },
  };
}

export function applyRadiusToTheme(
  inputTheme: AccioThemeDocument,
  radius: string
): AccioThemeDocument {
  return {
    ...inputTheme,
    updatedAt: new Date().toISOString(),
    tokens: {
      light: {
        ...inputTheme.tokens.light,
        radius,
      },
      dark: {
        ...inputTheme.tokens.dark,
        radius,
      },
    },
  };
}

export function applyFontSansToTheme(
  inputTheme: AccioThemeDocument,
  fontSans: string
): AccioThemeDocument {
  return {
    ...inputTheme,
    updatedAt: new Date().toISOString(),
    tokens: {
      light: {
        ...inputTheme.tokens.light,
        "font-sans": fontSans,
      },
      dark: {
        ...inputTheme.tokens.dark,
        "font-sans": fontSans,
      },
    },
  };
}

export function hasNavigationShell(data: { content: ReadonlyArray<{ type: string }> } | null | undefined): boolean {
  if (!data || !Array.isArray(data.content)) {
    return false;
  }
  return data.content.some((item) => item?.type === "AppSidebar");
}
