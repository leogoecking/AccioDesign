import { useMemo } from "react";
import { useLoaderData } from "react-router";
import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";

import type { Route } from "./+types/puck-splat";
import { config, EditorModeProvider, type Data as AppData } from "../../puck.config";
import { PuckRender } from "~/components/puck-render";
import { EditorSaveButton, EditorSaveProvider, useEditorSave } from "~/puck/editor-save";
import { puckDictionaryPtBr, puckViewportsPtBr } from "~/puck/dictionary-pt-br";
import { createTweakcnPlugin } from "~/puck/plugins/tweakcn-plugin";
import { resolvePuckPath } from "~/lib/resolve-puck-path.server";
import { getPage, savePage } from "~/lib/pages.server";
import { createThemeFromPreset } from "~/theme/schema";
import editorStyles from "@puckeditor/core/puck.css?url";

export async function loader({ params }: Route.LoaderArgs) {
  const pathname = params["*"] ?? "/";
  const { isEditorRoute, path } = resolvePuckPath(pathname);
  let page = (await getPage(path)) as AppData | undefined;

  // Throw a 404 if we're not rendering the editor and data for the page does not exist
  if (!isEditorRoute && !page) {
    throw new Response("Not Found", { status: 404 });
  }

  // Empty shell for new pages
  if (isEditorRoute && !page) {
    page = {
      content: [],
      root: {
        props: {
          title: "AccioDesign",
          theme: createThemeFromPreset("default", "light"),
        },
      },
      zones: {},
    };
  }

  return {
    isEditorRoute,
    path,
    data: page as Data,
  };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  return [
    {
      title: loaderData?.isEditorRoute
        ? `Editar: ${loaderData.path} — AccioDesign`
        : loaderData?.data?.root?.props?.title ?? "AccioDesign",
    },
  ];
}

export async function action({ params, request }: Route.ActionArgs) {
  const pathname = params["*"] ?? "/";
  const { path } = resolvePuckPath(pathname);
  const body = (await request.json()) as { data: Data };

  await savePage(path, body.data);
}

function Editor() {
  const loaderData = useLoaderData<typeof loader>();
  const save = useEditorSave(loaderData.data, `${loaderData.path === "/" ? "" : loaderData.path}/edit`);
  const plugins = useMemo(() => [createTweakcnPlugin({ saveAction: <EditorSaveButton /> })], []);

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
            data={loaderData.data}
            headerTitle="AccioDesign"
            headerPath={loaderData.path}
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

export default function PuckSplatRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      {loaderData.isEditorRoute ? (
        <Editor />
      ) : (
        <PuckRender data={loaderData.data} />
      )}
    </div>
  );
}
