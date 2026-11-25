import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function detectRepoRoot(): string {
  const candidates = [
    path.resolve(__dirname, "..", ".."),
    process.cwd(),
  ];

  for (const base of candidates) {
    if (
      fs.existsSync(path.join(base, "package.json")) &&
      fs.existsSync(path.join(base, "database.json"))
    ) {
      return base;
    }
  }

  return process.cwd();
}

export const REPO_ROOT = detectRepoRoot();
export const SEED_DATABASE_PATH = path.join(REPO_ROOT, "database.json");

export interface StorePathOptions {
  dataDir?: string;
  seedDatabasePath?: string;
}

export function resolveDataDir(options?: StorePathOptions): string {
  const raw = options?.dataDir ?? process.env.ACCIO_DATA_DIR;
  if (raw && raw.trim()) {
    return path.resolve(raw.trim());
  }
  return path.join(REPO_ROOT, ".accio-data");
}

export function resolveSeedDatabasePath(options?: StorePathOptions): string {
  return options?.seedDatabasePath
    ? path.resolve(options.seedDatabasePath)
    : SEED_DATABASE_PATH;
}
