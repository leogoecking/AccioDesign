import {
  normalizeThemeDocument,
  sanitizeTokenValue,
  type AccioThemeDocument,
} from "./schema";
import { syncGoogleFontsToDocument } from "./tweakcn/fonts";
import { getShadowMap } from "./tweakcn/shadows";
import {
  THEME_STYLE_KEYS,
  type ThemeMode,
  type ThemeStyleProps,
} from "./tweakcn/types";

const THEME_STYLE_ELEMENT_ID = "accio-tweakcn-theme";

function buildModeCssDeclarations(styles: ThemeStyleProps): string {
  const lines: string[] = [];

  for (const key of THEME_STYLE_KEYS) {
    const raw = styles[key];
    const safeValue = sanitizeTokenValue(key, raw);
    if (!safeValue) continue;
    lines.push(`  --${key}: ${safeValue};`);
  }

  const shadows = getShadowMap(styles);
  for (const [shadowKey, shadowValue] of Object.entries(shadows)) {
    lines.push(`  --${shadowKey}: ${shadowValue};`);
  }

  return lines.join("\n");
}

export function buildThemeCssText(
  inputTheme: AccioThemeDocument,
  options?: {
    scopeSelector?: string;
    includeRoot?: boolean;
  }
): string {
  const theme = normalizeThemeDocument(inputTheme);
  const scope = options?.scopeSelector || "[data-accio-theme]";
  const includeRoot = options?.includeRoot ?? true;

  const lightSelector = includeRoot ? `:root:root, ${scope}${scope}` : `${scope}${scope}`;
  const darkSelector = includeRoot
    ? `:root.dark:root, ${scope}${scope}.dark`
    : `${scope}${scope}.dark`;

  const lightCss = buildModeCssDeclarations(theme.tokens.light);
  const darkCss = buildModeCssDeclarations(theme.tokens.dark);

  return `${lightSelector} {\n${lightCss}\n}\n\n${darkSelector} {\n${darkCss}\n}`;
}

export function applyThemeToDocument(
  inputTheme: AccioThemeDocument,
  doc: Document
): void {
  if (!doc?.head || !doc?.documentElement) return;

  const theme = normalizeThemeDocument(inputTheme);
  const cssText = buildThemeCssText(theme, {
    includeRoot: true,
    scopeSelector: "[data-accio-theme]",
  });

  let styleEl = doc.getElementById(THEME_STYLE_ELEMENT_ID);
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = THEME_STYLE_ELEMENT_ID;
  }
  if (styleEl.textContent !== cssText) {
    styleEl.textContent = cssText;
  }
  if (doc.head.lastElementChild !== styleEl) {
    doc.head.appendChild(styleEl);
  }

  const mode: ThemeMode = theme.activeMode;
  doc.documentElement.classList.toggle("dark", mode === "dark");
  doc.documentElement.style.colorScheme = mode;

  syncGoogleFontsToDocument(doc, theme.tokens[mode]);
}

export function clearThemeFromDocument(doc: Document): void {
  if (!doc?.head || !doc?.documentElement) return;
  const styleEl = doc.getElementById(THEME_STYLE_ELEMENT_ID);
  if (styleEl) {
    styleEl.remove();
  }
  doc.documentElement.classList.remove("dark");
  doc.documentElement.style.colorScheme = "";
}
