/**
 * Adapted from Tweakcn (https://github.com/jnsahaj/tweakcn)
 * Original sources: utils/theme-fonts.ts, utils/fonts/index.ts, utils/fonts/google-fonts.ts
 * Licensed under the Apache License, Version 2.0 (see ./LICENSE-TWEAKCN-APACHE-2.0.txt).
 *
 * Modifications for AccioDesign:
 * - Consolidated curated font lists and Google Fonts URL generation into a single module.
 * - Scoped font stylesheet injection to any target `Document` (supporting both iframe preview and published page).
 */

import type { ThemeStyleProps } from "./types";

export type FontCategory = "sans-serif" | "serif" | "monospace";

export interface FontOption {
  label: string;
  family: string;
  value: string;
  category: FontCategory;
}

const SYSTEM_FONTS = new Set([
  "inter variable",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "arial",
  "helvetica",
  "georgia",
  "times new roman",
  "courier new",
]);

export const SANS_FONT_OPTIONS: FontOption[] = [
  {
    label: "Inter Variable (Padrão)",
    family: "Inter Variable",
    value: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Inter",
    family: "Inter",
    value: "Inter, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Plus Jakarta Sans",
    family: "Plus Jakarta Sans",
    value: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "DM Sans",
    family: "DM Sans",
    value: "DM Sans, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Outfit",
    family: "Outfit",
    value: "Outfit, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Poppins",
    family: "Poppins",
    value: "Poppins, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Open Sans",
    family: "Open Sans",
    value: "Open Sans, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Roboto",
    family: "Roboto",
    value: "Roboto, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Montserrat",
    family: "Montserrat",
    value: "Montserrat, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "IBM Plex Sans",
    family: "IBM Plex Sans",
    value: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Geist",
    family: "Geist",
    value: "Geist, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Space Grotesk",
    family: "Space Grotesk",
    value: "Space Grotesk, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
  {
    label: "Oxanium",
    family: "Oxanium",
    value: "Oxanium, ui-sans-serif, system-ui, sans-serif",
    category: "sans-serif",
  },
];

export const SERIF_FONT_OPTIONS: FontOption[] = [
  {
    label: "Georgia (Sistema)",
    family: "Georgia",
    value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    category: "serif",
  },
  {
    label: "Source Serif 4",
    family: "Source Serif 4",
    value: "Source Serif 4, ui-serif, Georgia, serif",
    category: "serif",
  },
  {
    label: "Merriweather",
    family: "Merriweather",
    value: "Merriweather, ui-serif, Georgia, serif",
    category: "serif",
  },
  {
    label: "Playfair Display",
    family: "Playfair Display",
    value: "Playfair Display, ui-serif, Georgia, serif",
    category: "serif",
  },
  {
    label: "Lora",
    family: "Lora",
    value: "Lora, ui-serif, Georgia, serif",
    category: "serif",
  },
  {
    label: "Libre Baskerville",
    family: "Libre Baskerville",
    value: "Libre Baskerville, ui-serif, Georgia, serif",
    category: "serif",
  },
];

export const MONO_FONT_OPTIONS: FontOption[] = [
  {
    label: "Sistema (Monospace)",
    family: "ui-monospace",
    value:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    category: "monospace",
  },
  {
    label: "JetBrains Mono",
    family: "JetBrains Mono",
    value: "JetBrains Mono, ui-monospace, monospace",
    category: "monospace",
  },
  {
    label: "Fira Code",
    family: "Fira Code",
    value: "Fira Code, ui-monospace, monospace",
    category: "monospace",
  },
  {
    label: "IBM Plex Mono",
    family: "IBM Plex Mono",
    value: "IBM Plex Mono, ui-monospace, monospace",
    category: "monospace",
  },
  {
    label: "Source Code Pro",
    family: "Source Code Pro",
    value: "Source Code Pro, ui-monospace, monospace",
    category: "monospace",
  },
  {
    label: "Roboto Mono",
    family: "Roboto Mono",
    value: "Roboto Mono, ui-monospace, monospace",
    category: "monospace",
  },
  {
    label: "Space Mono",
    family: "Space Mono",
    value: "Space Mono, ui-monospace, monospace",
    category: "monospace",
  },
  {
    label: "Geist Mono",
    family: "Geist Mono",
    value: "Geist Mono, ui-monospace, monospace",
    category: "monospace",
  },
];

export function extractFontFamily(fontFamilyValue: string): string | null {
  if (!fontFamilyValue) return null;
  const firstFont = fontFamilyValue.split(",")[0]?.trim() || "";
  const cleanFont = firstFont.replace(/['"]/g, "").trim();
  if (!cleanFont || SYSTEM_FONTS.has(cleanFont.toLowerCase())) {
    return null;
  }
  if (!/^[a-zA-Z0-9\s-]+$/.test(cleanFont)) {
    return null;
  }
  return cleanFont;
}

export function buildFontCssUrl(
  family: string,
  weights: string[] = ["400", "500", "600", "700"]
): string {
  const encodedFamily = encodeURIComponent(family);
  const weightsParam = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightsParam}&display=swap`;
}

export function getThemeGoogleFontUrls(
  styles: Partial<ThemeStyleProps>
): string[] {
  const families = new Set<string>();
  const slots = ["font-sans", "font-serif", "font-mono"] as const;

  for (const slot of slots) {
    const raw = styles[slot];
    if (!raw) continue;
    const family = extractFontFamily(raw);
    if (family) {
      families.add(family);
    }
  }

  return Array.from(families).map((family) => buildFontCssUrl(family));
}

export function syncGoogleFontsToDocument(
  doc: Document,
  styles: Partial<ThemeStyleProps>
): void {
  if (!doc?.head) return;

  const urls = getThemeGoogleFontUrls(styles);
  const existingLinks = Array.from(
    doc.head.querySelectorAll<HTMLLinkElement>("link[data-accio-font]")
  );
  const desiredSet = new Set(urls);

  for (const link of existingLinks) {
    const href = link.getAttribute("href") || "";
    if (!desiredSet.has(href)) {
      link.remove();
    }
  }

  for (const url of urls) {
    const alreadyPresent = doc.head.querySelector(
      `link[data-accio-font][href="${url}"]`
    );
    if (!alreadyPresent) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute("data-accio-font", "true");
      doc.head.appendChild(link);
    }
  }
}
