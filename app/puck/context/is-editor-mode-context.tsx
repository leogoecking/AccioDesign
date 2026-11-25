import { createContext, use, type ReactNode } from "react";

export interface EditorModeProviderProps {
  children: ReactNode;
  isEditor?: boolean;
  overlayRef?: (element: HTMLElement | null) => void | (() => void);
}

const OverlayContext = createContext<EditorModeProviderProps["overlayRef"]>(undefined);

const EditorModeContext = createContext<boolean | null>(null);

export const EditorModeProvider = ({
  children,
  isEditor = false,
  overlayRef,
}: EditorModeProviderProps) => {
  return (
    <EditorModeContext.Provider value={isEditor}>
      <OverlayContext.Provider value={overlayRef}>{children}</OverlayContext.Provider>
    </EditorModeContext.Provider>
  );
};

export const useIsEditorMode = (): boolean => {
  const context = use(EditorModeContext);
  return context ?? false;
};

export const useEditorOverlayRef = () => use(OverlayContext);
