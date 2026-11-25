import { useMemo, useRef, useState } from "react";
import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";
import editorStyles from "@puckeditor/core/puck.css?url";
import type { Route } from "./+types/projects.$projectId.edit";
import { getProject, saveProject } from "~/lib/projects.server";
import { useUnsavedChanges } from "~/hooks/use-unsaved-changes";
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
  const saved = useRef(JSON.stringify(project.data));
  const current = useRef(saved.current);
  const saving = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useUnsavedChanges(dirty);

  const plugins = useMemo(
    () => [
      createTweakcnPlugin({
        galleryHref: "/",
        playgroundHref: `/play/${project.id}`,
        presentHref: `/projects/${project.id}`,
      }),
    ],
    [project.id]
  );

  return (
    <>
      <link rel="stylesheet" href={editorStyles} id="puck-css" />
      {saveError && <div role="alert">Não foi possível salvar as alterações locais.</div>}
      <EditorModeProvider isEditor>
        <Puck
          config={config}
          data={project.data}
          headerTitle="AccioDesign"
          headerPath={project.name}
          plugins={plugins}
          onChange={(data) => {
            current.current = JSON.stringify(data);
            setDirty(current.current !== saved.current);
          }}
          onPublish={async (data) => {
            if (saving.current) return;
            saving.current = true;
            const snapshot = JSON.stringify(data);
            try {
              const response = await fetch(`/projects/${project.id}/edit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data }),
              });
              if (!response.ok) throw new Error("Falha ao salvar");
              saved.current = snapshot;
              setDirty(current.current !== snapshot);
              setSaveError(false);
            } catch {
              setSaveError(true);
            } finally {
              saving.current = false;
            }
          }}
        />
      </EditorModeProvider>
    </>
  );
}
