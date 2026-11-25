import path from "node:path";
import type { Data } from "@puckeditor/core";
import {
  resolveDataDir,
  resolveSeedDatabasePath,
  type StorePathOptions,
} from "./data-paths.server";

import { readPageMap, withStoreLock, writeJsonAtomic } from "./store.server";

function getLegacyStorePath(options?: StorePathOptions): string {
  return path.join(resolveDataDir(options), "legacy-pages.json");
}

export async function getPage(
  pagePath: string,
  options?: StorePathOptions
): Promise<Data | undefined> {
  return withStoreLock(resolveDataDir(options), async () => {
    const localPages = await readPageMap(getLegacyStorePath(options));
    if (Object.prototype.hasOwnProperty.call(localPages, pagePath)) {
      return localPages[pagePath];
    }

    // Fallback estritamente somente leitura para o seed versionado
    const seedPages = await readPageMap(resolveSeedDatabasePath(options));
    return seedPages[pagePath];
  });
}

export async function savePage(
  pagePath: string,
  data: Data,
  options?: StorePathOptions
): Promise<void> {
  const dataDir = resolveDataDir(options);
  const storePath = getLegacyStorePath(options);

  await withStoreLock(dataDir, async () => {
    const localPages = await readPageMap(storePath);
    localPages[pagePath] = data;
    await writeJsonAtomic(storePath, localPages);
  });
}
