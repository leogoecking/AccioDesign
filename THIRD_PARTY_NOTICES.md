# Third-Party Notices & Attributions

AccioDesign é distribuído sob a licença **Apache License 2.0** (ver [LICENSE](./LICENSE) e [NOTICE](./NOTICE)) e reutiliza ou adapta módulos dos projetos open source abaixo. Todos os créditos, avisos de copyright e termos originais são preservados.

---

## 1. Tweakcn

- **Repositório:** https://github.com/jnsahaj/tweakcn
- **Licença:** Apache License, Version 2.0 ([cópia integral](./app/theme/tweakcn/LICENSE-TWEAKCN-APACHE-2.0.txt))
- **Módulos reaproveitados e adaptados em `app/theme/tweakcn/`:**

| Arquivo local | Origem no Tweakcn | Adaptações realizadas |
| --- | --- | --- |
| `app/theme/tweakcn/types.ts` | `types/theme.ts`, `types/editor.ts` | Remoção de dependências `zod` e `drizzle-orm`; adição de allowlists `THEME_STYLE_KEYS` e `COLOR_STYLE_KEYS`. |
| `app/theme/tweakcn/defaults.ts` | `config/theme.ts` | Priorização de `'Inter Variable'` em `DEFAULT_FONT_SANS` e `currentMode: "light"` determinístico para SSR. |
| `app/theme/tweakcn/theme-presets.ts` | `utils/theme-presets.ts`, `utils/theme-preset-helper.ts` | Preservação integral dos 42 presets nativos; substituição do acoplamento com store Next.js por helpers puros (`getBuiltInPresetsList`, `resolvePresetStyles`). |
| `app/theme/tweakcn/color-converter.ts` | `utils/color-converter.ts` | Implementação pura em TypeScript (`hex`, `rgb`, `hsl`, `oklch`) sem dependência externa de `culori`, mais `colorToHex`. |
| `app/theme/tweakcn/shadows.ts` | `utils/shadows.ts` | Extração da função pura `getShadowMap(styles)` sem mutação global de `document.documentElement`. |
| `app/theme/tweakcn/fonts.ts` | `utils/theme-fonts.ts`, `utils/fonts/index.ts`, `utils/fonts/google-fonts.ts` | Consolidação das listas de fontes e injeção de `<link>` por documento (`syncGoogleFontsToDocument`) para iframe e página publicada. |
| `app/theme/tweakcn/css-generator.ts` | `utils/theme-style-generator.ts` | Geração de CSS Tailwind v4 (`generateThemeCode`) usando helpers puros e tokens do AccioDesign. |

Para mais detalhes, consulte também [app/theme/tweakcn/THIRD_PARTY_NOTICES.md](./app/theme/tweakcn/THIRD_PARTY_NOTICES.md).

---

## 2. Puck & `puck-configs` (`shadcn-twblocks`)

- **Puck (`@puckeditor/core`):** https://github.com/puckeditor/puck — Licença **MIT**
- **Referência `puck-configs` (`shadcn-twblocks`):** https://github.com/puckeditor/puck-configs *(nota: o checkout de referência utilizado não possuía arquivo `LICENSE` próprio confirmado na raiz do repositório `puck-configs`; portanto, nenhuma licença não confirmada é atribuída a ele, e a autoria original pertence aos mantenedores e contribuidores do Puck).*
- **Permissão de cópia consultada na Fase 5:** O [guia de integração shadcn-twblocks no commit 29ab421](https://github.com/puckeditor/puck-configs/blob/29ab421d096f7ca5294f8a521b5e7ee94ae9944f/shadcn-twblocks/README.md#using-the-shadcn-puck-component-configs) autoriza copiar componentes para um projeto e lista os arquivos compartilhados a copiar. O frontend é gerado para esse uso específico. O repositório não declara uma licença geral, e a [solicitação de licença upstream](https://github.com/puckeditor/puck-configs/issues/13) permanece aberta na data da verificação. A atribuição aos Puck Contributors é mantida. Uma eventual redistribuição desses trechos além do uso documentado deve ser verificada com os mantenedores.
- **Separação de autoria na Fase 3:** Os novos módulos da Gallery (`app/components/gallery/`, `app/routes/_index.tsx`), Modo Experimentar (`app/components/playground/`, `app/routes/play.$projectId.tsx`), persistência local isolada (`app/lib/projects.server.ts`), templates pt-BR (`app/templates/`) e o bloco `KanbanBoard` (`app/puck/config/components/kanban-board/`) foram escritos originalmente para o AccioDesign sob Apache 2.0, reutilizando os primitivos shadcn/ui e módulos Tweakcn listados neste documento.
- **Arquivos e padrões adaptados:**
  - Estrutura de aplicação React Router + Puck (`puck.config.tsx`, `app/routes/puck-splat.tsx`, `app/lib/pages.server.ts`, `app/lib/resolve-puck-path.server.ts`).
  - Infraestrutura em `app/puck/`: `context/is-editor-mode-context.tsx`, `components/error-boundary.tsx`, `components/badge.tsx`, `components/button.tsx`, `components/card.tsx`, `components/container.tsx`, `components/content.tsx`, `components/field.tsx`, `components/form.tsx` e `config/fields/index.tsx`.
  - Configurações e blocos adaptados em `app/puck/config/components/`: `header`, `footer`, `bento`, `card-grid`, `stats` e `form-block` (adaptado de `contact-us`), migrados de Next.js para React Router 7 + Vite + `radix-ui` unificado + registro estático de ícones Lucide.

---

## 3. shadcn/ui & Radix UI

- **shadcn/ui:** https://github.com/shadcn-ui/ui — Licença **MIT**
- **Radix UI:** https://github.com/radix-ui/primitives — Licença **MIT**
- **Arquivos no projeto:** primitivos em `app/components/ui/` (`avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `navigation-menu.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `tooltip.tsx`) e hook `app/hooks/use-mobile.ts`.

---

## 4. Fontes e Ícones

- **`@fontsource-variable/inter`:** SIL Open Font License 1.1 (`OFL-1.1`).
- **`lucide-react`:** Licença ISC (https://lucide.dev).

---

## 5. TokenBridge

- **Repositório:** https://github.com/GaoDesign/tokenbridge.dev
- **Commit analisado:** `eaf0c1cbced2fc76874c76ea789399b10eebfe5e`.
- **Copyright:** 2024-present GaoDesign. **Licença:** MIT ([texto integral](./app/export/tokenbridge/LICENSE-TOKENBRIDGE-MIT.txt)).
- **Origem e adaptação:** `src/lib/generator.ts` (formatos e organização de regras/tokens) e `src/lib/skill-generator.ts` (estrutura e princípios do `SKILL.md` e inventário) foram adaptados em `app/export/tokenbridge/`. Os modelos foram traduzidos para pt-BR e reduzidos ao documento e aos valores efetivos do AccioDesign; foram removidos Handlebars, store Zustand, valores padrão presumidos, geração de escalas e conversões de cor. O ZIP usa JSZip, também utilizado pelo upstream, com metadados fixos para reprodutibilidade. A aplicação Next.js, o editor e a store não são incorporados.
