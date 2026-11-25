import type { Route } from "./+types/projects.$projectId.export";
import { getProject } from "~/lib/projects.server";
import { buildDesignZip } from "~/export/design-export.server";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProject(params.projectId);
  if (!project) throw new Response("Projeto não encontrado", { status: 404 });
  const archive = await buildDesignZip(project);
  return new Response(archive as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="acciodesign-${project.id}.zip"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
