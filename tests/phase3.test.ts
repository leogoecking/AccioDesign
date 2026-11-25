import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { getPage, savePage } from "../app/lib/pages.server";
import {
  createProjectFromTemplate,
  deleteProject,
  getProject,
  listProjects,
  saveProject,
} from "../app/lib/projects.server";
import { config } from "../app/puck";
import {
  applyDensityToTheme,
  applyFontSansToTheme,
  applyRadiusToTheme,
  hasNavigationShell,
} from "../app/puck/context/layout-mode-context";
import {
  ALL_TEMPLATES_META,
  GALLERY_TEMPLATES_META,
  instantiateTemplate,
} from "../app/templates";
import { createThemeFromPreset, normalizeThemeDocument } from "../app/theme/schema";
import { getBuiltInPresetsList } from "../app/theme/tweakcn/theme-presets";

function collectAllComponentTypes(content: unknown[]): string[] {
  const types: string[] = [];

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    const record = node as { type?: unknown; props?: Record<string, unknown> };
    if (typeof record.type === "string") {
      types.push(record.type);
    }
    if (record.props && typeof record.props === "object") {
      for (const value of Object.values(record.props)) {
        if (Array.isArray(value)) {
          value.forEach(visit);
        }
      }
    }
  };

  content.forEach(visit);
  return types;
}

function collectAllComponentIds(content: unknown[]): string[] {
  const ids: string[] = [];

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    const record = node as { type?: unknown; props?: Record<string, unknown> };
    if (typeof record.type === "string" && record.props && typeof record.props.id === "string") {
      ids.push(record.props.id);
    }
    if (record.props && typeof record.props === "object") {
      for (const value of Object.values(record.props)) {
        if (Array.isArray(value)) {
          value.forEach(visit);
        }
      }
    }
  };

  content.forEach(visit);
  return ids;
}

async function withTempStore(
  fn: (ctx: {
    dataDir: string;
    seedDatabasePath: string;
    seedSnapshot: string;
  }) => Promise<void>
) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "accio-test-store-"));
  const dataDir = path.join(tempRoot, "accio-data");
  const repoSeedPath = path.resolve("database.json");
  const seedSnapshot = await fs.readFile(repoSeedPath, "utf8");
  const seedDatabasePath = path.join(tempRoot, "database.json");
  await fs.writeFile(seedDatabasePath, seedSnapshot, "utf8");

  try {
    await fn({ dataDir, seedDatabasePath, seedSnapshot });
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

describe("AccioDesign Fase 3 — Templates, Persistência Isolada e Compatibilidade", () => {
  it("cria documentos válidos e independentes para todos os templates iniciais e em branco", () => {
    assert.equal(GALLERY_TEMPLATES_META.length, 3);
    assert.equal(ALL_TEMPLATES_META.length, 4);

    for (const template of ALL_TEMPLATES_META) {
      const first = instantiateTemplate(template.id, `Teste ${template.name}`);
      const second = instantiateTemplate(template.id, `Outro ${template.name}`);

      assert.equal(first.root?.props?.title, `Teste ${template.name}`);
      assert.equal(second.root?.props?.title, `Outro ${template.name}`);
      assert.ok(Array.isArray(first.content));

      const firstIds = collectAllComponentIds(first.content);
      const secondIds = collectAllComponentIds(second.content);
      assert.equal(new Set(firstIds).size, firstIds.length);
      assert.equal(new Set(secondIds).size, secondIds.length);

      for (const id of firstIds) {
        assert.equal(
          secondIds.includes(id),
          false,
          `ID duplicado entre instâncias de ${template.id}: ${id}`
        );
      }

      if (template.id !== "em-branco") {
        assert.equal(hasNavigationShell(first), true);
        assert.ok(firstIds.length >= 5);
      } else {
        assert.equal(hasNavigationShell(first), false);
        assert.equal(first.content.length, 0);
      }
    }
  });

  it("isola projetos locais do database.json versionado e migra páginas customizadas sem perda", async () => {
    await withTempStore(async ({ dataDir, seedDatabasePath, seedSnapshot }) => {
      const created = await createProjectFromTemplate(
        "central-atendimento",
        "Projeto Cliente Demo",
        { dataDir, seedDatabasePath }
      );

      assert.ok(created.id.startsWith("proj-"));
      const afterSeedSnapshot = await fs.readFile(seedDatabasePath, "utf8");
      assert.equal(afterSeedSnapshot, seedSnapshot);

      // Também garante que rotas legadas escrevem apenas em legacy-pages.json fora do seed
      const customLegacyDoc = instantiateTemplate("dashboard-operacional", "Rota Customizada");
      await savePage("/cliente-a", customLegacyDoc, { dataDir, seedDatabasePath });
      const legacyRead = await getPage("/cliente-a", { dataDir, seedDatabasePath });
      assert.equal(legacyRead?.root?.props?.title, "Rota Customizada");
      assert.equal(await fs.readFile(seedDatabasePath, "utf8"), seedSnapshot);

      // Verifica fallback para seed quando página não está no armazenamento local
      const fallbackRoot = await getPage("/", { dataDir, seedDatabasePath });
      assert.ok(fallbackRoot);
      assert.equal(fallbackRoot.content?.[0]?.props?.id, "Header-accio-main");

      // Testa migração automática de database.json customizado sem alterar o seed
      const migratedDir = path.join(path.dirname(dataDir), "migrated-data");
      const customSeedPath = path.join(path.dirname(dataDir), "custom-seed.json");
      await fs.writeFile(
        customSeedPath,
        JSON.stringify({
          "/custom-portal": instantiateTemplate("sistema-administrativo", "Portal Migrado"),
        }),
        "utf8"
      );
      const migratedProjects = await listProjects({
        dataDir: migratedDir,
        seedDatabasePath: customSeedPath,
      });
      assert.equal(migratedProjects.length, 1);
      assert.equal(migratedProjects[0]?.name, "Portal Migrado");
    });
  });

  it("preserva conteúdo, blocos e props ao alternar temas Tweakcn, modo claro/escuro, tipografia, densidade e navegação", () => {
    const presets = getBuiltInPresetsList();
    assert.ok(presets.length >= 42);

    for (const templateId of [
      "sistema-administrativo",
      "dashboard-operacional",
      "central-atendimento",
    ] as const) {
      const doc = instantiateTemplate(templateId);
      const originalContentSnapshot = structuredClone(doc.content);
      const originalZonesSnapshot = structuredClone(doc.zones);

      let workingRoot = { ...(doc.root?.props ?? {}) };

      // Alterna temas, claro/escuro, fonte, densidade, raio e navegação
      for (const presetId of ["default", "clean-slate", "ocean-breeze", "violet-bloom"]) {
        const theme = createThemeFromPreset(presetId, "dark");
        const adjustedTheme = applyRadiusToTheme(
          applyDensityToTheme(
            applyFontSansToTheme(theme, "DM Sans, ui-sans-serif, system-ui, sans-serif"),
            "compact"
          ),
          "0.375rem"
        );
        workingRoot = {
          ...workingRoot,
          theme: adjustedTheme,
          density: "compact",
          navigationMode: "rail",
        };
      }

      workingRoot = {
        ...workingRoot,
        navigationMode: "topnav",
      };

      assert.deepStrictEqual(doc.content, originalContentSnapshot);
      assert.deepStrictEqual(doc.zones, originalZonesSnapshot);
      assert.equal(workingRoot.navigationMode, "topnav");
      assert.equal(workingRoot.density, "compact");
      assert.equal(normalizeThemeDocument(workingRoot.theme).activeMode, "dark");
    }
  });

  it("persiste alterações de tema, nome e navegação após recarregamento do disco", async () => {
    await withTempStore(async ({ dataDir, seedDatabasePath }) => {
      const created = await createProjectFromTemplate(
        "sistema-administrativo",
        "ERP Inicial",
        { dataDir, seedDatabasePath }
      );

      const updatedTheme = applyDensityToTheme(
        createThemeFromPreset("violet-bloom", "dark"),
        "comfortable"
      );

      const updatedDoc = {
        ...created.data,
        root: {
          ...created.data.root,
          props: {
            title: created.data.root?.props?.title || "ERP Aprovado",
            ...created.data.root?.props,
            navigationMode: "topnav" as const,
            density: "comfortable" as const,
            theme: updatedTheme,
          },
        },
      };

      await saveProject(
        created.id,
        { name: "ERP Aprovado", data: updatedDoc },
        { dataDir, seedDatabasePath }
      );

      const reloaded = await getProject(created.id, { dataDir, seedDatabasePath });
      assert.ok(reloaded);
      assert.equal(reloaded.name, "ERP Aprovado");
      assert.equal(reloaded.data.root?.props?.navigationMode, "topnav");
      assert.equal(reloaded.data.root?.props?.density, "comfortable");
      assert.equal(reloaded.data.root?.props?.theme?.presetId, "violet-bloom");
      assert.equal(reloaded.data.root?.props?.theme?.activeMode, "dark");
      assert.deepStrictEqual(reloaded.data.content, created.data.content);

      const removed = await deleteProject(created.id, {
        dataDir,
        seedDatabasePath,
      });
      assert.equal(removed, true);
      assert.equal(await getProject(created.id, { dataDir, seedDatabasePath }), null);
    });
  });

  it("mantém compatibilidade integral entre Experimentar, Editar e Apresentar com o catálogo do Puck", () => {
    const registeredComponents = new Set(Object.keys(config.components));
    assert.equal(registeredComponents.has("KanbanBoard"), true);
    assert.equal(registeredComponents.size, 20);

    for (const template of GALLERY_TEMPLATES_META) {
      const data = instantiateTemplate(template.id);
      const usedTypes = collectAllComponentTypes(data.content);
      assert.ok(usedTypes.length > 0);
      for (const componentType of usedTypes) {
        assert.equal(
          registeredComponents.has(componentType),
          true,
          `Componente não registrado em Puck config: ${componentType}`
        );
      }

      const normalizedTheme = normalizeThemeDocument(data.root?.props?.theme);
      assert.equal(normalizedTheme.schemaVersion, "1.0");
      assert.equal(normalizedTheme.source, "tweakcn");
    }
  });
});
