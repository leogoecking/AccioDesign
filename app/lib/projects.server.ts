import { createHash, randomUUID } from "node:crypto";
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

import { readJsonFile, readPageMap, withStoreLock, writeJsonAtomic } from "./store.server";

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
  const parsed = await readJsonFile(storePath);
  if (parsed === undefined) return null;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Armazenamento de projetos inválido: ${storePath}`);
  }
  const store = parsed as Partial<ProjectsStoreFile>;
  if (store.version !== 1 || typeof store.migratedSeed !== "boolean" || !Array.isArray(store.projects) ||
      store.projects.some(project => !project || typeof project !== "object" || typeof project.id !== "string" || typeof project.name !== "string" || typeof project.updatedAt !== "string" || !project.data || typeof project.data !== "object" || !Array.isArray(project.data.content))) {
    throw new Error(`Armazenamento de projetos inválido: ${storePath}`);
  }
  return store as ProjectsStoreFile;
}

// Fingerprint of the original versioned root document, independent of JSON key order.
const ORIGINAL_ROOT_HASH = "07b0f9e8f4ea92737892f3d898301066f2b534e0e741408076c3764a1abdc23b";
function canonical(value: any): any {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
function isCustomSeedPage(pagePath: string, pageData: AppData): boolean {
  return pagePath !== "/" || createHash("sha256").update(JSON.stringify(canonical(pageData))).digest("hex") !== ORIGINAL_ROOT_HASH;
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
  const legacyLocalPages = await readPageMap(
    path.join(dataDir, "legacy-pages.json")
  );
  const seedPages = await readPageMap(resolveSeedDatabasePath(options));
  const candidates: Array<[string, AppData]> = [];

  for (const [pagePath, pageData] of Object.entries(legacyLocalPages)) {
    candidates.push([pagePath, pageData]);
  }
  for (const [pagePath, pageData] of Object.entries(seedPages)) {
    if (isCustomSeedPage(pagePath, pageData) &&
        (!legacyLocalPages[pagePath] || JSON.stringify(canonical(legacyLocalPages[pagePath])) !== JSON.stringify(canonical(pageData)))) {
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

  await writeJsonAtomic(storePath, nextStore);
  return nextStore;
}

export async function listProjects(
  options?: StorePathOptions
): Promise<LocalProject[]> {
  return withStoreLock(resolveDataDir(options), async () => {
    const store = await ensureStore(options);
    return [...store.projects].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  });
}

export async function getProject(
  projectId: string,
  options?: StorePathOptions
): Promise<LocalProject | null> {
  return withStoreLock(resolveDataDir(options), async () => {
    const cleanId = sanitizeProjectId(projectId);
    if (!cleanId) return null;
    const store = await ensureStore(options);
    const found = store.projects.find((item) => item.id === cleanId);
    if (!found) return null;
    return {
      ...found,
      data: normalizeProjectData(found.data, found.name),
    };
  });
}

export async function createProjectFromTemplate(
  templateId: string,
  customName?: string,
  options?: StorePathOptions
): Promise<LocalProject> {
  return withStoreLock(resolveDataDir(options), async () => {
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
    await writeJsonAtomic(storePath, store);
    return project;
  });
}

export async function saveProject(
  projectId: string,
  patch: { name?: string; data?: AppData },
  options?: StorePathOptions
): Promise<LocalProject | null> {
  return withStoreLock(resolveDataDir(options), async () => {
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
    await writeJsonAtomic(storePath, store);
    return updated;
  });
}

export async function deleteProject(
  projectId: string,
  options?: StorePathOptions
): Promise<boolean> {
  return withStoreLock(resolveDataDir(options), async () => {
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

    await writeJsonAtomic(storePath, store);
    return true;
  });
}
