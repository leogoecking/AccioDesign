import JSZip from "jszip";
import { assertNoCredentials } from "./validate-export.server";
import type { LocalProject } from "~/lib/projects.server";
import { buildThemeCssText } from "~/theme/apply-theme";
import { generateThemeCode } from "~/theme/tweakcn/css-generator";
import { normalizeThemeDocument } from "~/theme/schema";
import { adaptThemeForExport, TOKENBRIDGE_UNMAPPED_FIELDS } from "./tokenbridge/adapter";
import { makeComponentsMd, makeDesignMd, SKILL_MD } from "./tokenbridge/contracts";

export function buildDesignFiles(project: LocalProject): Record<string, string> {
  assertNoCredentials({ name: project.name, templateId: project.templateId, data: project.data });
  const theme = normalizeThemeDocument(project.data.root?.props?.theme);
  // Reuse Tweakcn's Tailwind v4 theme bindings and the exact declarations used
  // by the preview. Unlike generateThemeCode's default, this does not convert colors.
  const tailwindCode = generateThemeCode(theme.tokens);
  const themeIndex = tailwindCode.indexOf("@theme inline");
  if (themeIndex < 0) throw new Error("Bindings Tailwind indisponíveis");
  const bindings = tailwindCode.slice(themeIndex).replace(
    "  --radius-xl: calc(var(--radius) * 1.4);",
    `  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --tracking-tighter: calc(var(--letter-spacing) - 0.05em);
  --tracking-tight: calc(var(--letter-spacing) - 0.025em);
  --tracking-normal: var(--letter-spacing);
  --tracking-wide: calc(var(--letter-spacing) + 0.025em);
  --tracking-wider: calc(var(--letter-spacing) + 0.05em);
  --tracking-widest: calc(var(--letter-spacing) + 0.1em);`
  );
  const css = `@import "tailwindcss";\n\n@custom-variant dark (&:is(.dark *));\n\n${buildThemeCssText(theme)}\n\n${bindings}\n`;
  const manifest = {
    format: "acciodesign.design-export",
    formatVersion: "1.0",
    project: { id: project.id, name: project.name, templateId: project.templateId, updatedAt: project.updatedAt },
    compatibility: {
      themeSchema: theme.schemaVersion,
      puck: "0.24",
      tailwind: "4",
      activeMode: theme.activeMode,
      tokenbridgeUpstream: "eaf0c1cbced2fc76874c76ea789399b10eebfe5e",
      unmappedFields: [...TOKENBRIDGE_UNMAPPED_FIELDS],
    },
  };
  const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
  return {
    "manifest.json": json(manifest),
    "design.json": json(project.data),
    "tokens.json": json(adaptThemeForExport(theme)),
    "theme.css": css,
    "DESIGN.md": makeDesignMd(project, theme),
    "SKILL.md": SKILL_MD,
    "components.md": makeComponentsMd(project),
  };
}

export async function buildDesignZip(project: LocalProject): Promise<Uint8Array> {
  const files = buildDesignFiles(project);
  const zip = new JSZip();
  const date = new Date(1980, 0, 1, 0, 0, 0);
  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content, { date, createFolders: false, compression: "STORE" });
  }
  return zip.generateAsync({ type: "uint8array", compression: "STORE", platform: "DOS" });
}
