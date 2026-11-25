# Third-Party Notices

This directory (`app/theme/tweakcn/`) incorporates and adapts open-source modules from **Tweakcn**:

- **Project:** Tweakcn (`https://github.com/jnsahaj/tweakcn`)
- **License:** Apache License, Version 2.0 (full text preserved in `LICENSE-TWEAKCN-APACHE-2.0.txt`)

## Reused & Adapted Files

| Local File | Upstream Source | Summary of Adaptations |
| --- | --- | --- |
| `types.ts` | `types/theme.ts`, `types/editor.ts` | Removed `zod` and `drizzle-orm` runtime dependencies; added readonly key allowlists (`THEME_STYLE_KEYS`, `COLOR_STYLE_KEYS`). |
| `defaults.ts` | `config/theme.ts` | Adapted `DEFAULT_FONT_SANS` to prioritize `'Inter Variable'` and made `defaultThemeState.currentMode` deterministic (`"light"`) for SSR safety. |
| `theme-presets.ts` | `utils/theme-presets.ts`, `utils/theme-preset-helper.ts` | Preserved all 42 built-in presets verbatim; replaced Next.js store coupling with pure helpers `getBuiltInPresetsList` and `resolvePresetStyles`. |
| `color-converter.ts` | `utils/color-converter.ts` | Implemented pure TypeScript hex/rgb/hsl/oklch conversions to avoid adding `culori`; added `colorToHex` for color inputs. |
| `shadows.ts` | `utils/shadows.ts` | Extracted pure `getShadowMap(styles)` helper without mutating host `document.documentElement`. |
| `fonts.ts` | `utils/theme-fonts.ts`, `utils/fonts/index.ts`, `utils/fonts/google-fonts.ts` | Consolidated curated font lists and document-scoped Google Fonts `<link>` injection (`syncGoogleFontsToDocument`) for both preview iframe and published page. |
| `css-generator.ts` | `utils/theme-style-generator.ts` | Kept Tailwind CSS v4 output generator (`generateThemeCode`) using pure helpers and AccioDesign defaults. |
