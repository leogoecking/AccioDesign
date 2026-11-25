import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";

import { config, EditorModeProvider } from "../../puck.config";

export function PuckRender({ data }: { data: Data }) {
  return (
    <EditorModeProvider isEditor={false}>
      <Render config={config} data={data} />
    </EditorModeProvider>
  );
}
