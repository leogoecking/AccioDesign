import path from "node:path";
import projectPackage from "../../package.json";
import license from "../../LICENSE?raw";
import notice from "../../NOTICE?raw";
import attributions from "../../THIRD_PARTY_NOTICES.md?raw";
import shadcnLicense from "./licenses/LICENSE-SHADCN-MIT.txt?raw";
import spellUiLicense from "./licenses/LICENSE-SPELLUI-MIT.txt?raw";
import tokenbridgeLicense from "./tokenbridge/LICENSE-TOKENBRIDGE-MIT.txt?raw";
import { config } from "~/puck";
import type { LocalProject } from "~/lib/projects.server";
import type { AccioThemeDocument } from "~/theme/schema";
import { extractFontFamily } from "~/theme/tweakcn/fonts";
import { mapSlots, readBlocks, type DocumentBlock, type SlotFields } from "./frontend/document";
import { frontendSources } from "./frontend-sources.server";

// The catalog, never project data, decides which paths can enter the archive.
const viewPaths = Object.keys(frontendSources).filter(file => file.startsWith("puck/config/components/"));
const CSS_DEPENDENCIES = ["tailwindcss", "tw-animate-css", "shadcn", "@fontsource-variable/inter"];
const LOCAL_FONTS: Readonly<Record<string, string>> = {
  Inter: "@fontsource/inter",
  Merriweather: "@fontsource/merriweather",
  "JetBrains Mono": "@fontsource/jetbrains-mono",
  "DM Sans": "@fontsource/dm-sans",
  Lora: "@fontsource/lora",
  "IBM Plex Mono": "@fontsource/ibm-plex-mono",
};

type Field = {
  type: string;
  arrayFields?: unknown;
  objectFields?: unknown;
};

function getSlotFields(fields: unknown): SlotFields {
  const slots: SlotFields = {};
  if (!fields || typeof fields !== "object") return slots;
  for (const [name, field] of Object.entries(fields) as Array<[string, Field]>) {
    if (field.type === "slot") slots[name] = "slot";
    const nested = field.type === "array" ? field.arrayFields : field.type === "object" ? field.objectFields : undefined;
    if (nested) {
      const children = getSlotFields(nested);
      if (Object.keys(children).length) slots[name] = { kind: field.type as "array" | "object", fields: children };
    }
  }
  return slots;
}

function collectViews(content: unknown) {
  const views = new Map<string, { file: string; slots: SlotFields }>();
  const visit = (blocks: DocumentBlock[]) => {
    for (const { type, props } of blocks) {
      let view = views.get(type);
      if (!view) {
        const component = Object.hasOwn(config.components, type)
          ? config.components[type as keyof typeof config.components]
          : undefined;
        const file = viewPaths.find(file => path.posix.basename(file, ".tsx").replaceAll("-", "").toLowerCase() === type.toLowerCase());
        if (!component || !file) throw new Error(`Componente sem suporte à exportação React: ${type}`);
        view = { file, slots: getSlotFields(component.fields ?? {}) };
        views.set(type, view);
      }
      mapSlots(props, view.slots, visit);
    }
  };
  visit(readBlocks(content));
  return views;
}

function collectSources(entryPoints: string[]) {
  const files: Record<string, string> = {};
  const packages = new Set(["react", "react-dom", ...CSS_DEPENDENCIES]);
  const visited = new Set<string>();

  function visit(file: string) {
    if (visited.has(file)) return;
    const source = frontendSources[file];
    if (!Object.hasOwn(frontendSources, file)) throw new Error(`Módulo fora do catálogo: ${file}`);
    visited.add(file);
    files[`src/${file}`] = source;

    // Catalog modules use static ES imports and re-exports, including type imports.
    const imports = source.matchAll(/^\s*(?:import|export)\s+(?:[\w*{},\s]+?\s+from\s+)?["']([^"']+)["']/gm);
    for (const [, specifier] of imports) {
      if (!specifier.startsWith("~/") && !specifier.startsWith(".")) {
        packages.add(specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/"));
        continue;
      }
      const base = specifier.startsWith("~/")
        ? specifier.slice(2)
        : path.posix.join(path.posix.dirname(file), specifier);
      const dependency = [base, `${base}.ts`, `${base}.tsx`].find(candidate => Object.hasOwn(frontendSources, candidate));
      if (!dependency) throw new Error(`Dependência fora do catálogo: ${specifier} em ${file}`);
      visit(dependency);
    }
  }

  entryPoints.forEach(visit);
  const dependencies = Object.fromEntries([...packages].sort().map(name => {
    const version = (projectPackage.dependencies as Record<string, string>)[name];
    if (!version || name === "@puckeditor/core") throw new Error(`Dependência React não autorizada: ${name}`);
    return [name, version];
  }));
  return { files, dependencies };
}

const VITE_CONFIG = `import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) } },
  base: "./",
});
`;

export function buildReactFiles(project: LocalProject, theme: AccioThemeDocument, css: string): Record<string, string> {
  const views = collectViews(project.data.content);
  const { files, dependencies } = collectSources([
    "export/frontend/runtime.tsx",
    ...Array.from(views.values(), view => view.file),
  ]);
  const fontFamilies = new Set<string>();
  for (const mode of ["light", "dark"] as const) {
    for (const key of ["font-sans", "font-serif", "font-mono"] as const) {
      const family = extractFontFamily(theme.tokens[mode][key]);
      if (family) fontFamilies.add(family);
    }
  }

  const fontPackages: string[] = [];
  const otherFonts: string[] = [];
  for (const family of [...fontFamilies].sort()) {
    const pkg = Object.hasOwn(LOCAL_FONTS, family) ? LOCAL_FONTS[family] : undefined;
    if (pkg) {
      dependencies[pkg] = "5.3.0";
      fontPackages.push(pkg);
    } else {
      otherFonts.push(family);
    }
  }

  const imports = Array.from(views, ([name, view]) => `import { ${name} } from "~/${view.file.replace(/\.tsx$/, "")}";`);
  const registry = Array.from(views, ([name, view]) => `  ${name}: { view: ${name}, slots: ${JSON.stringify(view.slots)} },`);
  const fontImports = fontPackages.flatMap(pkg => [400, 500, 600, 700].map(weight => `import "${pkg}/${weight}.css";`));
  const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
  const usesSpellUi =
    Object.hasOwn(files, "src/components/ui/fallback-avatar.tsx") ||
    Object.hasOwn(files, "src/components/ui/copy-button.tsx");

  const frontend = {
    ...files,
    "package.json": json({
      name: "acciodesign-frontend",
      version: "1.0.0",
      private: true,
      type: "module",
      engines: { node: ">=20.19.0" },
      scripts: { dev: "vite", typecheck: "tsc --noEmit", build: "vite build", preview: "vite preview" },
      dependencies,
      devDependencies: {
        "@tailwindcss/vite": projectPackage.dependencies["@tailwindcss/vite"],
        ...Object.fromEntries(["@types/node", "@types/react", "@types/react-dom", "typescript", "vite"].map(name =>
          [name, projectPackage.devDependencies[name as keyof typeof projectPackage.devDependencies]]
        )),
      },
    }),
    "tsconfig.json": json({
      compilerOptions: {
        target: "ES2022", module: "ESNext", moduleResolution: "Bundler",
        lib: ["ES2022", "DOM", "DOM.Iterable"], jsx: "react-jsx",
        types: ["vite/client"], paths: { "~/*": ["./src/*"] },
        strict: true, skipLibCheck: true, resolveJsonModule: true, noEmit: true,
      },
      include: ["src", "vite.config.ts"],
    }),
    "vite.config.ts": VITE_CONFIG,
    "index.html": `<!doctype html>
<html lang="pt-BR" class="${theme.activeMode === "dark" ? "dark" : ""}" style="color-scheme: ${theme.activeMode}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Design exportado · AccioDesign</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "src/main.tsx": `import { createRoot } from "react-dom/client";
import { DesignView, type ComponentRegistry } from "~/export/frontend/runtime";
import data from "./design.json";
${[...imports, ...fontImports].join("\n")}
import "./theme.css";

const registry = {
${registry.join("\n")}
} satisfies ComponentRegistry;

const root = data.root as { props?: { title?: string } };
document.title = root.props?.title || "Design exportado · AccioDesign";
createRoot(document.getElementById("root")!).render(
  <DesignView data={data} registry={registry} theme={${JSON.stringify({ activeMode: theme.activeMode, presetId: theme.presetId })}} />
);
`,
    "src/design.json": json(project.data),
    "src/theme.css": css,
    "README.md": `# Frontend exportado pelo AccioDesign

Use Node.js 20.19+ e npm. Neste diretório, execute:

\`\`\`sh
npm install
npm run typecheck
npm run build
npm run dev
\`\`\`

O Vite serve a interface localmente. A pasta \`dist/\` contém o build estático.
A instalação usa pacotes do npm. A interface não precisa do AccioDesign nem do Puck.

- \`src/main.tsx\` reúne as views utilizadas. Preserve o layout ao conectar APIs e regras de negócio.
- \`src/design.json\` contém os dados demonstrativos. Substitua-os gradualmente e mantenha as propriedades visuais e a ordem dos slots.
- \`src/puck/config/components/\` contém as views originais reaproveitadas. Sem as configurações de edição, os nomes dos diretórios continuam servindo como referência ao catálogo do AccioDesign.
- \`src/theme.css\` contém os tokens aprovados e regras compartilhadas. Para conectar uma troca de modo, atualize a classe \`dark\` e \`color-scheme\` no HTML e o modo passado a \`DesignView\`.
- Recursos remotos e links gravados no documento continuam sendo dados do projeto. As zonas legadas sem consumidor no catálogo são preservadas no JSON.

O pacote inclui Inter Variable e, quando usadas, fontes dos templates via Fontsource (OFL-1.1). As licenças acompanham os respectivos pacotes npm.
${otherFonts.length ? `Fontes adicionais a fornecer no destino para reproduzir a tipografia: ${otherFonts.join(", ")}. Até lá, o navegador usa os fallbacks aprovados.\n` : ""}
Consulte LICENSE, NOTICE e THIRD_PARTY_NOTICES.md para atribuições. Os caminhos do inventário do contrato referem-se ao repositório AccioDesign.
`,
    "LICENSE": license,
    "NOTICE": notice,
    "THIRD_PARTY_NOTICES.md": attributions,
    "licenses/LICENSE-TOKENBRIDGE-MIT.txt": tokenbridgeLicense,
    "licenses/LICENSE-SHADCN-MIT.txt": shadcnLicense,
    ...(usesSpellUi ? { "licenses/LICENSE-SPELLUI-MIT.txt": spellUiLicense } : {}),
  };
  return Object.fromEntries(Object.entries(frontend).map(([file, source]) => [`frontend/${file}`, source]));
}
