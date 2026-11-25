import fs from "node:fs/promises";
import path from "node:path";
import type { Data } from "@puckeditor/core";
import {
  resolveDataDir,
  resolveSeedDatabasePath,
  type StorePathOptions,
} from "./data-paths.server";

function getLegacyStorePath(options?: StorePathOptions): string {
  return path.join(resolveDataDir(options), "legacy-pages.json");
}

async function readJsonMap(filePath: string): Promise<Record<string, Data>> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, Data>;
  } catch (error: unknown) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    if (code !== "ENOENT") {
      console.error(`Falha ao ler arquivo de páginas (${filePath}):`, error);
    }
    return {};
  }
}

export async function getPage(
  pagePath: string,
  options?: StorePathOptions
): Promise<Data | undefined> {
  const localPages = await readJsonMap(getLegacyStorePath(options));
  if (Object.prototype.hasOwnProperty.call(localPages, pagePath)) {
    return localPages[pagePath];
  }

  // Fallback estritamente somente leitura para o seed versionado
  const seedPages = await readJsonMap(resolveSeedDatabasePath(options));
  return seedPages[pagePath];
}

export async function savePage(
  pagePath: string,
  data: Data,
  options?: StorePathOptions
): Promise<void> {
  const dataDir = resolveDataDir(options);
  const storePath = getLegacyStorePath(options);

  await fs.mkdir(dataDir, { recursive: true });
  const localPages = await readJsonMap(storePath);
  localPages[pagePath] = data;

  const tempPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(localPages, null, 2), {
    encoding: "utf8",
  });
  await fs.rename(tempPath, storePath);
}
