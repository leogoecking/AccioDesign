import { useMemo } from "react";
import { useFetcher } from "react-router";
import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";
import editorStyles from "@puckeditor/core/puck.css?url";
import type { Route } from "./+types/projects.$projectId.edit";
import { getProject, saveProject } from "~/lib/projects.server";
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
  const fetcher = useFetcher<typeof action>();

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
      <EditorModeProvider isEditor>
        <Puck
          config={config}
          data={project.data}
          headerTitle="AccioDesign"
          headerPath={project.name}
          plugins={plugins}
          onPublish={async (data) => {
            await fetcher.submit(
              { data },
              {
                action: "",
                method: "post",
                encType: "application/json",
              }
            );
          }}
        />
      </EditorModeProvider>
    </>
  );
}
