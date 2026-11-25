import JSZip from "jszip";
import { assertNoCredentials } from "./validate-export.server";
import type { LocalProject } from "~/lib/projects.server";
import { buildThemeCssText } from "~/theme/apply-theme";
import visualContractCss from "../theme/visual-contract.css?raw";
import { normalizeThemeDocument } from "~/theme/schema";
import { adaptThemeForExport, TOKENBRIDGE_UNMAPPED_FIELDS } from "./tokenbridge/adapter";
import { makeComponentsMd, makeDesignMd, SKILL_MD } from "./tokenbridge/contracts";

export function buildDesignFiles(project: LocalProject): Record<string, string> {
  assertNoCredentials({ name: project.name, templateId: project.templateId, data: project.data });
  const theme = normalizeThemeDocument(project.data.root?.props?.theme);
  // The same visual rules and CSS dependencies are used by app/app.css.
  const css = `${visualContractCss}\n${buildThemeCssText(theme)}\n`;
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
