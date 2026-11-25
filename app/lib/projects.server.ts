import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Data as AppData } from "~/puck";
import type { RootProps } from "~/puck/components/root";
import { normalizeThemeDocument } from "~/theme/schema";
import {
  cloneAndRefreshDocumentIds,
  getTemplateDefinition,
  instantiateTemplate,
  isTemplateId,
} from "~/templates";
import {
  resolveDataDir,
  resolveSeedDatabasePath,
  type StorePathOptions,
} from "./data-paths.server";

export interface LocalProject {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  data: AppData;
}

interface ProjectsStoreFile {
  version: 1;
  migratedSeed: boolean;
  projects: LocalProject[];
}

function getProjectsStorePath(options?: StorePathOptions): string {
  return path.join(resolveDataDir(options), "projects.json");
}

function sanitizeProjectId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function normalizeProjectData(rawData: AppData, fallbackTitle: string): AppData {
  const rootProps = (rawData.root?.props ?? {}) as Partial<RootProps>;
  return {
    ...rawData,
    root: {
      ...(rawData.root ?? {}),
      props: {
        ...rootProps,
        title:
          typeof rootProps.title === "string" && rootProps.title.trim()
            ? rootProps.title
            : fallbackTitle,
        theme: normalizeThemeDocument(rootProps.theme),
      },
    },
    content: Array.isArray(rawData.content) ? rawData.content : [],
    zones:
      rawData.zones && typeof rawData.zones === "object" ? rawData.zones : {},
  };
}

async function readStoreRaw(storePath: string): Promise<ProjectsStoreFile | null> {
  try {
    const content = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(content) as Partial<ProjectsStoreFile>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      version: 1,
      migratedSeed: Boolean(parsed.migratedSeed),
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch (error: unknown) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    if (code !== "ENOENT") {
      console.error(`Falha ao ler ${storePath}:`, error);
    }
    return null;
  }
}

async function writeStoreAtomic(
  dataDir: string,
  storePath: string,
  store: ProjectsStoreFile
): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  const tempPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), {
    encoding: "utf8",
  });
  await fs.rename(tempPath, storePath);
}

async function readSeedDatabase(seedPath: string): Promise<Record<string, AppData>> {
  try {
    const content = await fs.readFile(seedPath, "utf8");
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, AppData>;
  } catch {
    return {};
  }
}

function isCustomSeedPage(pagePath: string, pageData: AppData): boolean {
  if (!pageData || typeof pageData !== "object") return false;
  if (pagePath !== "/") return true;
  const firstId = pageData.content?.[0]?.props?.id;
  // Seed padrão possui primeiro bloco Header-accio-main; preserva se usuário o customizou antes da Fase 3
  return firstId !== "Header-accio-main";
}

async function ensureStore(options?: StorePathOptions): Promise<ProjectsStoreFile> {
  const dataDir = resolveDataDir(options);
  const storePath = getProjectsStorePath(options);
  const existing = await readStoreRaw(storePath);

  if (existing && existing.migratedSeed) {
    return existing;
  }

  const migratedProjects: LocalProject[] = existing?.projects
    ? [...existing.projects]
    : [];

  // Preserva páginas legadas já gravadas fora do seed sem tocar em database.json
  const legacyLocalPages = await readSeedDatabase(
    path.join(dataDir, "legacy-pages.json")
  );
  const seedPages = await readSeedDatabase(resolveSeedDatabasePath(options));
  const candidates: Array<[string, AppData]> = [];

  for (const [pagePath, pageData] of Object.entries(legacyLocalPages)) {
    candidates.push([pagePath, pageData]);
  }
  for (const [pagePath, pageData] of Object.entries(seedPages)) {
    if (isCustomSeedPage(pagePath, pageData) && !legacyLocalPages[pagePath]) {
      candidates.push([pagePath, pageData]);
    }
  }

  const now = new Date().toISOString();
  for (const [pagePath, pageData] of candidates) {
    const title =
      typeof pageData.root?.props?.title === "string" &&
      pageData.root.props.title.trim()
        ? pageData.root.props.title.trim()
        : pagePath === "/"
          ? "Painel migrado"
          : `Página ${pagePath}`;
    migratedProjects.push({
      id: `proj-${randomUUID().slice(0, 8)}`,
      name: title,
      description: `Migrado automaticamente da rota ${pagePath}`,
      templateId: "legacy-import",
      createdAt: now,
      updatedAt: now,
      data: normalizeProjectData(cloneAndRefreshDocumentIds(pageData), title),
    });
  }

  const nextStore: ProjectsStoreFile = {
    version: 1,
    migratedSeed: true,
    projects: migratedProjects,
  };

  await writeStoreAtomic(dataDir, storePath, nextStore);
  return nextStore;
}

export async function listProjects(
  options?: StorePathOptions
): Promise<LocalProject[]> {
  const store = await ensureStore(options);
  return [...store.projects].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export async function getProject(
  projectId: string,
  options?: StorePathOptions
): Promise<LocalProject | null> {
  const cleanId = sanitizeProjectId(projectId);
  if (!cleanId) return null;
  const store = await ensureStore(options);
  const found = store.projects.find((item) => item.id === cleanId);
  if (!found) return null;
  return {
    ...found,
    data: normalizeProjectData(found.data, found.name),
  };
}

export async function createProjectFromTemplate(
  templateId: string,
  customName?: string,
  options?: StorePathOptions
): Promise<LocalProject> {
  const store = await ensureStore(options);
  const dataDir = resolveDataDir(options);
  const storePath = getProjectsStorePath(options);

  const resolvedTemplateId = isTemplateId(templateId)
    ? templateId
    : "sistema-administrativo";
  const templateDef = getTemplateDefinition(resolvedTemplateId);
  const name =
    customName && customName.trim()
      ? customName.trim().slice(0, 80)
      : templateDef.name;

  const now = new Date().toISOString();
  const project: LocalProject = {
    id: `proj-${randomUUID().slice(0, 8)}`,
    name,
    description: templateDef.description,
    templateId: resolvedTemplateId,
    createdAt: now,
    updatedAt: now,
    data: normalizeProjectData(
      instantiateTemplate(resolvedTemplateId, name),
      name
    ),
  };

  store.projects.unshift(project);
  await writeStoreAtomic(dataDir, storePath, store);
  return project;
}

export async function saveProject(
  projectId: string,
  patch: { name?: string; data?: AppData },
  options?: StorePathOptions
): Promise<LocalProject | null> {
  const cleanId = sanitizeProjectId(projectId);
  if (!cleanId) return null;

  const store = await ensureStore(options);
  const dataDir = resolveDataDir(options);
  const storePath = getProjectsStorePath(options);

  const index = store.projects.findIndex((item) => item.id === cleanId);
  if (index === -1) return null;

  const current = store.projects[index];
  const nextName =
    typeof patch.name === "string" && patch.name.trim()
      ? patch.name.trim().slice(0, 80)
      : current.name;

  const nextData = patch.data
    ? normalizeProjectData(patch.data, nextName)
    : current.data;

  const updated: LocalProject = {
    ...current,
    name: nextName,
    updatedAt: new Date().toISOString(),
    data: nextData,
  };

  store.projects[index] = updated;
  await writeStoreAtomic(dataDir, storePath, store);
  return updated;
}

export async function deleteProject(
  projectId: string,
  options?: StorePathOptions
): Promise<boolean> {
  const cleanId = sanitizeProjectId(projectId);
  if (!cleanId) return false;

  const store = await ensureStore(options);
  const dataDir = resolveDataDir(options);
  const storePath = getProjectsStorePath(options);

  const before = store.projects.length;
  store.projects = store.projects.filter((item) => item.id !== cleanId);
  if (store.projects.length === before) {
    return false;
  }

  await writeStoreAtomic(dataDir, storePath, store);
  return true;
}
