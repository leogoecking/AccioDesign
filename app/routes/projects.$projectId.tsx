import type { Route } from "./+types/projects.$projectId";
import { PuckRender } from "~/components/puck-render";
import { getProject } from "~/lib/projects.server";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProject(params.projectId);
  if (!project) {
    throw new Response("Projeto não encontrado", { status: 404 });
  }
  return { project };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title:
        data?.project?.data?.root?.props?.title ||
        data?.project?.name ||
        "Apresentação — AccioDesign",
    },
  ];
}

export default function PresentProjectRoute({
  loaderData,
}: Route.ComponentProps) {
  return <PuckRender data={loaderData.project.data} />;
}
