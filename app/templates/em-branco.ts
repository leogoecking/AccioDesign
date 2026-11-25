import { createThemeFromPreset } from "~/theme/schema";
import type { TemplateDefinition } from "./types";

export const emBrancoTemplate: TemplateDefinition = {
  id: "em-branco",
  name: "Estrutura em branco",
  category: "Livre",
  description:
    "Tela limpa para montar sua própria estrutura do zero diretamente no editor de blocos.",
  highlights: ["Canvas livre", "Todos os 20 blocos", "Temas Tweakcn prontos"],
  previewKind: "blank",
  defaultPresetId: "default",
  defaultNavigationMode: "sidebar",
  supportsNavigationModes: false,
  buildData: () => ({
    root: {
      props: {
        title: "Novo Projeto — AccioDesign",
        description: "Projeto criado a partir de uma estrutura em branco.",
        surface: "muted",
        navigationMode: "sidebar",
        density: "default",
        theme: createThemeFromPreset("default", "light", "Padrão (AccioDesign)"),
      },
    },
    content: [],
    zones: {},
  }),
};
