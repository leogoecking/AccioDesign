import { Form, Link, redirect } from "react-router";
import {
  ArrowRight,
  ExternalLink,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Route } from "./+types/_index";
import { TemplateThumbnail } from "~/components/gallery/template-thumbnail";
import {
  createProjectFromTemplate,
  deleteProject,
  listProjects,
  type LocalProject,
} from "~/lib/projects.server";
import { GALLERY_TEMPLATES_META, getTemplateDefinition } from "~/templates";
import { normalizeThemeDocument } from "~/theme/schema";
import { getBuiltInPresetsList } from "~/theme/tweakcn/theme-presets";

export function meta() {
  return [
    {
      title: "AccioDesign — Laboratório visual de interfaces",
    },
  ];
}

export async function loader() {
  const projects = await listProjects();
  return {
    templates: GALLERY_TEMPLATES_META,
    projects,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "create") {
    const templateId = String(formData.get("templateId") || "sistema-administrativo");
    const customName = formData.get("name");
    const project = await createProjectFromTemplate(
      templateId,
      typeof customName === "string" ? customName : undefined
    );
    return redirect(`/play/${project.id}`);
  }

  if (intent === "delete") {
    const projectId = String(formData.get("projectId") || "");
    if (projectId) {
      await deleteProject(projectId);
    }
    return { ok: true };
  }

  return { ok: false };
}

function formatUpdatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Agora";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getProjectOriginLabel(templateId: string): string {
  if (templateId === "legacy-import") return "Migrado";
  return getTemplateDefinition(templateId).name;
}

function ProjectRow({ project }: { project: LocalProject }) {
  const themeDoc = normalizeThemeDocument(project.data.root?.props?.theme);
  const activeTokens = themeDoc.tokens[themeDoc.activeMode];

  return (
    <li className="flex flex-col justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/play/${project.id}`}
            className="truncate text-sm font-medium text-zinc-900 hover:underline"
          >
            {project.name}
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
            <span
              className="size-2 rounded-full border border-black/15"
              style={{ backgroundColor: activeTokens.primary }}
            />
            <span>{themeDoc.name}</span>
            <span className="text-zinc-400">·</span>
            <span>{themeDoc.activeMode === "dark" ? "Escuro" : "Claro"}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span>Base: {getProjectOriginLabel(project.templateId)}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            Atualizado em {formatUpdatedAt(project.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          to={`/play/${project.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <span>Experimentar</span>
        </Link>
        <Link
          to={`/projects/${project.id}/edit`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <Pencil className="size-3.5" />
          <span>Editar</span>
        </Link>
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <ExternalLink className="size-3.5" />
          <span>Apresentar</span>
        </Link>
        <Form
          method="post"
          onSubmit={(event) => {
            if (
              typeof window !== "undefined" &&
              !window.confirm(`Remover o projeto "${project.name}"?`)
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="projectId" value={project.id} />
          <button
            type="submit"
            title="Excluir projeto"
            aria-label={`Excluir ${project.name}`}
            className="inline-flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="size-3.5" />
          </button>
        </Form>
      </div>
    </li>
  );
}

export default function GalleryHomeRoute({ loaderData }: Route.ComponentProps) {
  const { templates, projects } = loaderData;
  const presets = getBuiltInPresetsList();

  const presetPrimaryById = new Map(
    presets.map((preset) => [preset.id, preset.styles.light.primary])
  );

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Layers className="size-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                AccioDesign
              </h1>
              <p className="text-xs text-zinc-500">
                Provador visual de interfaces e identidades antes da implementação
              </p>
            </div>
          </div>

          <Form method="post">
            <input type="hidden" name="intent" value="create" />
            <input type="hidden" name="templateId" value="em-branco" />
            <button
              type="submit"
              data-testid="create-blank-project"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              <Plus className="size-3.5" />
              <span>Começar em branco</span>
            </button>
          </Form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {/* Galeria de templates */}
        <section aria-labelledby="gallery-templates-heading" className="space-y-4">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
            <div>
              <h2
                id="gallery-templates-heading"
                className="text-lg font-semibold tracking-tight text-zinc-900"
              >
                Escolha uma estrutura para experimentar
              </h2>
              <p className="text-sm text-zinc-600">
                Abra um template pronto no provador para testar 43 temas, tipografia, densidade e navegação sem recriar código.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {templates.map((template) => {
              const accentColor =
                presetPrimaryById.get(template.defaultPresetId) ?? "#18181b";

              return (
                <article
                  key={template.id}
                  data-testid={`template-card-${template.id}`}
                  className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white transition-colors hover:border-zinc-300"
                >
                  <TemplateThumbnail
                    kind={template.previewKind}
                    accentColor={accentColor}
                  />

                  <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {template.name}
                        </h3>
                        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-600">
                        {template.description}
                      </p>
                    </div>

                    <Form method="post">
                      <input type="hidden" name="intent" value="create" />
                      <input
                        type="hidden"
                        name="templateId"
                        value={template.id}
                      />
                      <button
                        type="submit"
                        data-testid={`try-template-${template.id}`}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
                      >
                        <span>Experimentar</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </Form>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Projetos locais salvos */}
        <section aria-labelledby="local-projects-heading" className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2
                id="local-projects-heading"
                className="text-lg font-semibold tracking-tight text-zinc-900"
              >
                Projetos locais
              </h2>
              <p className="text-sm text-zinc-600">
                Armazenados localmente fora do controle de versão para seus testes e apresentações.
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-500 tabular-nums">
              {projects.length}{" "}
              {projects.length === 1 ? "projeto" : "projetos"}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-8 text-center">
              <p className="text-sm font-medium text-zinc-900">
                Nenhum projeto local salvo ainda
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Clique em Experimentar em qualquer template acima ou inicie uma estrutura em branco.
              </p>
            </div>
          ) : (
            <ul
              data-testid="local-projects-list"
              className="divide-y divide-zinc-200/80 overflow-hidden rounded-xl border border-zinc-200/90 bg-white"
            >
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
