import { createContext, use, type ReactNode } from "react";

interface EditorModeProviderProps {
  children: ReactNode;
  isEditor?: boolean;
}

const EditorModeContext = createContext<boolean | null>(null);

export const EditorModeProvider = ({
  children,
  isEditor = false,
}: EditorModeProviderProps) => {
  return (
    <EditorModeContext.Provider value={isEditor}>
      {children}
    </EditorModeContext.Provider>
  );
};

export const useIsEditorMode = (): boolean => {
  const context = use(EditorModeContext);
  return context ?? false;
};
