import { useMemo } from "react";
import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";
import editorStyles from "@puckeditor/core/puck.css?url";
import type { Route } from "./+types/projects.$projectId.edit";
import { getProject, saveProject } from "~/lib/projects.server";
import { EditorSaveButton, EditorSaveProvider, useEditorSave } from "~/puck/editor-save";
import { puckDictionaryPtBr, puckViewportsPtBr } from "~/puck/dictionary-pt-br";
import { createTweakcnPlugin } from "~/puck/plugins/tweakcn-plugin";
import { config, EditorModeProvider, type Data as AppData } from "../../puck.config";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProject(params.projectId);
  if (!project) {
    throw new Response("Projeto não encontrado", { status: 404 });
  }
  return { project };
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.project?.name ?? "Editar projeto";
  return [{ title: `Editar: ${title} — AccioDesign` }];
}

export async function action({ params, request }: Route.ActionArgs) {
  const body = (await request.json()) as { data: Data };
  const updated = await saveProject(params.projectId, {
    data: body.data as AppData,
  });

  if (!updated) {
    throw new Response("Projeto não encontrado", { status: 404 });
  }

  return { ok: true };
}

export default function EditProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;
  const save = useEditorSave(project.data, `/projects/${project.id}/edit`);

  const plugins = useMemo(
    () => [
      createTweakcnPlugin({
        galleryHref: "/",
        playgroundHref: `/play/${project.id}`,
        presentHref: `/projects/${project.id}`,
        saveAction: <EditorSaveButton />,
      }),
    ],
    [project.id]
  );

  return (
    <>
      <link rel="stylesheet" href={editorStyles} id="puck-css" />
      {save.saveError && (
        <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700">
          Não foi possível salvar as alterações locais. Tente novamente.
        </div>
      )}
      <EditorSaveProvider value={save}>
        <EditorModeProvider isEditor>
          <Puck
            config={config}
            data={project.data}
            headerTitle="AccioDesign"
            headerPath={project.name}
            plugins={plugins}
            dictionary={puckDictionaryPtBr}
            viewports={puckViewportsPtBr}
            onChange={save.onChange}
          />
        </EditorModeProvider>
      </EditorSaveProvider>
    </>
  );
}
