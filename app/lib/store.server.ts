import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

// A single queue per data directory also protects migration against legacy writes.
const queues = new Map<string, Promise<void>>();
export async function withStoreLock<T>(dataDir: string, operation: () => Promise<T>): Promise<T> {
  const key = path.resolve(dataDir);
  const previous = queues.get(key) ?? Promise.resolve();
  const result = previous.then(operation);
  const settled = result.then(() => {}, () => {});
  queues.set(key, settled);
  try { return await result; } finally {
    if (queues.get(key) === settled) queues.delete(key);
  }
}

export async function readJsonFile(filePath: string): Promise<unknown | undefined> {
  let content: string;
  try { content = await fs.readFile(filePath, "utf8"); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
  try { return JSON.parse(content); }
  catch (error) { throw new Error(`JSON inválido em ${filePath}`, { cause: error }); }
}

export async function readPageMap(filePath: string): Promise<Record<string, any>> {
  const parsed = await readJsonFile(filePath);
  if (parsed === undefined) return {};
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
      Object.values(parsed).some(value => !value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.content))) {
    throw new Error(`Arquivo de páginas inválido: ${filePath}`);
  }
  return parsed as Record<string, any>;
}

export async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(tempPath, JSON.stringify(value, null, 2), { encoding: "utf8", flag: "wx" });
    await fs.rename(tempPath, filePath);
  } finally { await fs.rm(tempPath, { force: true }); }
}
