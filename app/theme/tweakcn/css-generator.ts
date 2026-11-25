/**
 * Adapted from Tweakcn (https://github.com/jnsahaj/tweakcn)
 * Original source: utils/theme-style-generator.ts
 * Licensed under the Apache License, Version 2.0 (see ./LICENSE-TWEAKCN-APACHE-2.0.txt).
 *
 * Modifications for AccioDesign:
 * - Focused output on Tailwind CSS v4 (`@theme inline`, `:root`, `.dark`, `@layer base`).
 * - Replaced Next.js store imports with pure helpers and AccioDesign defaults.
 */

import { colorFormatter } from "./color-converter";
import { defaultLightThemeStyles } from "./defaults";
import { getShadowMap } from "./shadows";
import type { ColorFormat, ThemeMode, ThemeStyles } from "./types";

const generateColorVariables = (
  themeStyles: ThemeStyles,
  mode: ThemeMode,
  formatColor: (color: string) => string
): string => {
  const styles = themeStyles[mode];
  return `
  --background: ${formatColor(styles.background)};
  --foreground: ${formatColor(styles.foreground)};
  --card: ${formatColor(styles.card)};
  --card-foreground: ${formatColor(styles["card-foreground"])};
  --popover: ${formatColor(styles.popover)};
  --popover-foreground: ${formatColor(styles["popover-foreground"])};
  --primary: ${formatColor(styles.primary)};
  --primary-foreground: ${formatColor(styles["primary-foreground"])};
  --secondary: ${formatColor(styles.secondary)};
  --secondary-foreground: ${formatColor(styles["secondary-foreground"])};
  --muted: ${formatColor(styles.muted)};
  --muted-foreground: ${formatColor(styles["muted-foreground"])};
  --accent: ${formatColor(styles.accent)};
  --accent-foreground: ${formatColor(styles["accent-foreground"])};
  --destructive: ${formatColor(styles.destructive)};
  --destructive-foreground: ${formatColor(styles["destructive-foreground"])};
  --border: ${formatColor(styles.border)};
  --input: ${formatColor(styles.input)};
  --ring: ${formatColor(styles.ring)};
  --chart-1: ${formatColor(styles["chart-1"])};
  --chart-2: ${formatColor(styles["chart-2"])};
  --chart-3: ${formatColor(styles["chart-3"])};
  --chart-4: ${formatColor(styles["chart-4"])};
  --chart-5: ${formatColor(styles["chart-5"])};
  --sidebar: ${formatColor(styles.sidebar)};
  --sidebar-foreground: ${formatColor(styles["sidebar-foreground"])};
  --sidebar-primary: ${formatColor(styles["sidebar-primary"])};
  --sidebar-primary-foreground: ${formatColor(styles["sidebar-primary-foreground"])};
  --sidebar-accent: ${formatColor(styles["sidebar-accent"])};
  --sidebar-accent-foreground: ${formatColor(styles["sidebar-accent-foreground"])};
  --sidebar-border: ${formatColor(styles["sidebar-border"])};
  --sidebar-ring: ${formatColor(styles["sidebar-ring"])};`;
};

const generateThemeVariables = (
  themeStyles: ThemeStyles,
  mode: ThemeMode,
  formatColor: (color: string) => string
): string => {
  const selector = mode === "dark" ? ".dark" : ":root";
  const styles = themeStyles[mode];
  const shadowMap = getShadowMap(styles);

  const fontVars = `
  --font-sans: ${styles["font-sans"]};
  --font-serif: ${styles["font-serif"]};
  --font-mono: ${styles["font-mono"]};`;

  const rawShadowVars = `
  --shadow-color: ${styles["shadow-color"]};
  --shadow-opacity: ${styles["shadow-opacity"]};
  --shadow-blur: ${styles["shadow-blur"]};
  --shadow-spread: ${styles["shadow-spread"]};
  --shadow-x: ${styles["shadow-offset-x"]};
  --shadow-y: ${styles["shadow-offset-y"]};`;

  const shadowVars = Object.entries(shadowMap)
    .map(([key, value]) => `\n  --${key}: ${value};`)
    .join("");

  const radiusVar = `\n  --radius: ${styles.radius};`;
  const spacingVar =
    mode === "light"
      ? `\n  --spacing: ${themeStyles.light.spacing ?? defaultLightThemeStyles.spacing};`
      : "";
  const trackingVar =
    mode === "light"
      ? `\n  --letter-spacing: ${themeStyles.light["letter-spacing"] ?? defaultLightThemeStyles["letter-spacing"]};`
      : "";

  return `${selector} {${generateColorVariables(themeStyles, mode, formatColor)}${fontVars}${radiusVar}${rawShadowVars}${shadowVars}${trackingVar}${spacingVar}\n}`;
};

export const generateThemeCode = (
  themeStyles: ThemeStyles,
  colorFormat: ColorFormat = "oklch"
): string => {
  const formatColor = (color: string) =>
    colorFormatter(color, colorFormat, "4");

  const lightTheme = generateThemeVariables(themeStyles, "light", formatColor);
  const darkTheme = generateThemeVariables(themeStyles, "dark", formatColor);

  return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

${lightTheme}

${darkTheme}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    letter-spacing: var(--letter-spacing, 0em);
  }
}`;
};
