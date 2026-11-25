/**
 * Adapted from TokenBridge generator.ts and skill-generator.ts, commit
 * eaf0c1cbced2fc76874c76ea789399b10eebfe5e. Copyright (c) 2024-present
 * GaoDesign. MIT license: ./LICENSE-TOKENBRIDGE-MIT.txt.
 * The original fixed 24-color/HSL model and computed scales are replaced
 * with the approved AccioDesign values; absent fields are not synthesized.
 */
import type { AccioThemeDocument } from "~/theme/schema";

export const TOKENBRIDGE_UNMAPPED_FIELDS = [
  "success, successForeground, warning, warningForeground, info e infoForeground: não existem no schema de cores do AccioDesign",
  "typography.baseFontSize, typography.scaleRatio e typography.lineHeight: não definidos no tema",
  "spacing.scale: escala explícita não definida no tema",
  "effects.borderWidth, effects.buttonSize, effects.inputStyle e effects.inputBackground: não definidos no tema",
  "colorLocks e darkModeLocks: não se aplicam ao documento AccioDesign",
  "chart-1 a chart-5, sidebar-* e font-serif: sem correspondência no modelo TokenBridge; preservados em modes",
  "TokenBridge usa cores HSL sem função e tipografia global; a projeção mantém valores CSS originais por modo sem convertê-los",
] as const;

const SHARED_COLORS: Record<string, string> = {
  background: "background", foreground: "foreground", card: "card", "card-foreground": "cardForeground",
  popover: "popover", "popover-foreground": "popoverForeground", primary: "primary", "primary-foreground": "primaryForeground",
  secondary: "secondary", "secondary-foreground": "secondaryForeground", muted: "muted", "muted-foreground": "mutedForeground",
  accent: "accent", "accent-foreground": "accentForeground", destructive: "destructive", "destructive-foreground": "destructiveForeground",
  border: "border", input: "input", ring: "ring",
};

/** Projection of shared TokenBridge concepts without conversion or invented values. */
export function adaptThemeForExport(theme: AccioThemeDocument) {
  return {
    schemaVersion: "1.0",
    source: "AccioThemeDocument",
    activeMode: theme.activeMode,
    theme: { id: theme.id, name: theme.name, presetId: theme.presetId },
    modes: {
      light: { ...theme.tokens.light },
      dark: { ...theme.tokens.dark },
    },
    tokenbridgeCompatibility: {
      colors: Object.fromEntries(Object.entries(SHARED_COLORS).map(([key, target]) => [target, theme.tokens.light[key as keyof typeof theme.tokens.light]])),
      darkMode: Object.fromEntries(Object.entries(SHARED_COLORS).map(([key, target]) => [target, theme.tokens.dark[key as keyof typeof theme.tokens.dark]])),
      typographyByMode: {
        light: { fontFamily: theme.tokens.light["font-sans"], fontFamilyMono: theme.tokens.light["font-mono"] },
        dark: { fontFamily: theme.tokens.dark["font-sans"], fontFamilyMono: theme.tokens.dark["font-mono"] },
      },
      unmappedFields: [...TOKENBRIDGE_UNMAPPED_FIELDS],
    },
  };
}
