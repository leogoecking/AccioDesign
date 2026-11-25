import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("play/:projectId", "routes/play.$projectId.tsx"),
  route("projects/:projectId", "routes/projects.$projectId.tsx"),
  route("projects/:projectId/export", "routes/projects.$projectId.export.ts"),
  route("projects/:projectId/edit", "routes/projects.$projectId.edit.tsx"),
  route("*", "routes/puck-splat.tsx"),
] satisfies RouteConfig;
