/**
 * Adapted from Tweakcn (https://github.com/jnsahaj/tweakcn)
 * Original sources: types/theme.ts, types/editor.ts
 * Licensed under the Apache License, Version 2.0 (see ./LICENSE-TWEAKCN-APACHE-2.0.txt).
 *
 * Modifications for AccioDesign:
 * - Removed zod and drizzle-orm dependencies in favor of pure TypeScript types.
 * - Added THEME_STYLE_KEYS and COLOR_STYLE_KEYS allowlists for validation and sanitization.
 */

export type ThemeMode = "light" | "dark";

export type ColorFormat = "hex" | "hsl" | "oklch" | "rgb";

export const COLOR_STYLE_KEYS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "shadow-color",
] as const;

export const NON_COLOR_STYLE_KEYS = [
  "font-sans",
  "font-serif",
  "font-mono",
  "radius",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "letter-spacing",
  "spacing",
] as const;

export const THEME_STYLE_KEYS = [
  ...COLOR_STYLE_KEYS,
  ...NON_COLOR_STYLE_KEYS,
] as const;

export type ThemeStyleKey = (typeof THEME_STYLE_KEYS)[number];
export type ColorStyleKey = (typeof COLOR_STYLE_KEYS)[number];

export interface ThemeStyleProps {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
  "font-sans": string;
  "font-serif": string;
  "font-mono": string;
  radius: string;
  "shadow-color": string;
  "shadow-opacity": string;
  "shadow-blur": string;
  "shadow-spread": string;
  "shadow-offset-x": string;
  "shadow-offset-y": string;
  "letter-spacing": string;
  spacing?: string;
}

export interface ThemeStyles {
  light: ThemeStyleProps;
  dark: ThemeStyleProps;
}

export interface ThemePreset {
  source?: "SAVED" | "BUILT_IN";
  createdAt?: string;
  label?: string;
  styles: {
    light: Partial<ThemeStyleProps>;
    dark: Partial<ThemeStyleProps>;
  };
}

export interface ThemeEditorState {
  preset?: string;
  styles: ThemeStyles;
  currentMode: ThemeMode;
}
