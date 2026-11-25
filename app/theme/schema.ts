import { parseColor } from "./tweakcn/color-converter";
import { defaultThemeState } from "./tweakcn/defaults";
import { defaultPresets, resolvePresetStyles } from "./tweakcn/theme-presets";
import {
  COLOR_STYLE_KEYS,
  THEME_STYLE_KEYS,
  type ThemeMode,
  type ThemeStyleKey,
  type ThemeStyleProps,
  type ThemeStyles,
} from "./tweakcn/types";

export interface AccioThemeDocument {
  schemaVersion: "1.0";
  source: "tweakcn";
  id: string;
  name: string;
  presetId: string;
  activeMode: ThemeMode;
  updatedAt: string;
  tokens: ThemeStyles;
}

const UNSAFE_CSS_PATTERN =
  /[<>{};`\\]|url\s*\(|expression\s*\(|javascript:|@import|\/\*|\*\//i;
const FONT_VALUE_PATTERN = /^[a-zA-Z0-9\s,'"-]+$/;
const DIMENSION_VALUE_PATTERN = /^-?\d+(?:\.\d+)?(?:px|rem|em)$/;
const OPACITY_VALUE_PATTERN = /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/;

const COLOR_KEY_SET = new Set<string>(COLOR_STYLE_KEYS);
const THEME_KEY_SET = new Set<string>(THEME_STYLE_KEYS);

export function sanitizeTokenValue(
  key: ThemeStyleKey,
  raw: unknown
): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 240) return null;
  if (UNSAFE_CSS_PATTERN.test(value)) return null;

  if (COLOR_KEY_SET.has(key)) {
    return parseColor(value) ? value : null;
  }

  if (key === "font-sans" || key === "font-serif" || key === "font-mono") {
    return FONT_VALUE_PATTERN.test(value) ? value : null;
  }

  if (key === "shadow-opacity") {
    return OPACITY_VALUE_PATTERN.test(value) ? value : null;
  }

  if (
    key === "radius" ||
    key === "spacing" ||
    key === "letter-spacing" ||
    key === "shadow-blur" ||
    key === "shadow-spread" ||
    key === "shadow-offset-x" ||
    key === "shadow-offset-y"
  ) {
    if (value === "0") return "0px";
    return DIMENSION_VALUE_PATTERN.test(value) ? value : null;
  }

  return null;
}

function sanitizeModeTokens(
  rawTokens: unknown,
  fallback: ThemeStyleProps
): ThemeStyleProps {
  const result: ThemeStyleProps = { ...fallback };
  if (!rawTokens || typeof rawTokens !== "object") {
    return result;
  }

  const record = rawTokens as Record<string, unknown>;
  for (const key of THEME_STYLE_KEYS) {
    if (!THEME_KEY_SET.has(key)) continue;
    const sanitized = sanitizeTokenValue(key, record[key]);
    if (sanitized !== null) {
      result[key] = sanitized;
    }
  }

  return result;
}

export function createThemeFromPreset(
  presetId = "default",
  activeMode: ThemeMode = "light",
  customName?: string
): AccioThemeDocument {
  const resolvedPresetId =
    presetId === "default" || defaultPresets[presetId] ? presetId : "default";
  const styles = resolvePresetStyles(resolvedPresetId);
  const presetLabel =
    resolvedPresetId === "default"
      ? "Padrão (AccioDesign)"
      : defaultPresets[resolvedPresetId]?.label || resolvedPresetId;

  return {
    schemaVersion: "1.0",
    source: "tweakcn",
    id: `theme-${resolvedPresetId}`,
    name: customName?.trim() || presetLabel,
    presetId: resolvedPresetId,
    activeMode: activeMode === "dark" ? "dark" : "light",
    updatedAt: "2026-01-01T00:00:00.000Z",
    tokens: styles,
  };
}

export function normalizeThemeDocument(input: unknown): AccioThemeDocument {
  if (!input || typeof input !== "object") {
    return createThemeFromPreset("default", "light");
  }

  const raw = input as Partial<AccioThemeDocument> & {
    tokens?: Partial<ThemeStyles>;
  };

  const presetId =
    typeof raw.presetId === "string" &&
    (raw.presetId === "default" || Boolean(defaultPresets[raw.presetId]))
      ? raw.presetId
      : "default";

  const activeMode: ThemeMode = raw.activeMode === "dark" ? "dark" : "light";
  const baseStyles = resolvePresetStyles(presetId);

  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim().slice(0, 80)
      : presetId === "default"
        ? "Padrão (AccioDesign)"
        : defaultPresets[presetId]?.label || presetId;

  const id =
    typeof raw.id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(raw.id)
      ? raw.id
      : `theme-${presetId}`;

  return {
    schemaVersion: "1.0",
    source: "tweakcn",
    id,
    name,
    presetId,
    activeMode,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt.trim().slice(0, 40)
        : "2026-01-01T00:00:00.000Z",
    tokens: {
      light: sanitizeModeTokens(raw.tokens?.light, {
        ...defaultThemeState.styles.light,
        ...baseStyles.light,
      }),
      dark: sanitizeModeTokens(raw.tokens?.dark, {
        ...defaultThemeState.styles.dark,
        ...baseStyles.dark,
      }),
    },
  };
}

export function parseImportedThemeJson(
  jsonText: string
): { ok: true; theme: AccioThemeDocument } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      error: "JSON inválido. Verifique a sintaxe antes de importar.",
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      error: "O arquivo JSON deve conter um objeto de tema válido.",
    };
  }

  const record = parsed as Record<string, unknown>;
  const tokensRecord = record.tokens as Record<string, unknown> | undefined;
  if (
    !tokensRecord ||
    typeof tokensRecord !== "object" ||
    !tokensRecord.light ||
    !tokensRecord.dark
  ) {
    return {
      ok: false,
      error:
        "Estrutura inválida: o JSON deve possuir `tokens.light` e `tokens.dark`.",
    };
  }

  for (const mode of ["light", "dark"] as const) {
    const modeTokens = tokensRecord[mode];
    if (!modeTokens || typeof modeTokens !== "object") {
      return {
        ok: false,
        error: `Estrutura inválida em \`tokens.${mode}\`.`,
      };
    }

    for (const [key, value] of Object.entries(
      modeTokens as Record<string, unknown>
    )) {
      if (!THEME_KEY_SET.has(key)) continue;
      if (value !== undefined && sanitizeTokenValue(key as ThemeStyleKey, value) === null) {
        return {
          ok: false,
          error: `Valor inválido ou inseguro para o token \`${key}\` em \`${mode}\`.`,
        };
      }
    }
  }

  const normalized = normalizeThemeDocument(parsed);
  return { ok: true, theme: normalized };
}
