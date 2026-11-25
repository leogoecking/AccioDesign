import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useGetPuck, type Data } from "@puckeditor/core";
import { Check, Save } from "lucide-react";
import { useUnsavedChanges } from "~/hooks/use-unsaved-changes";

type SaveState = {
  dirty: boolean;
  isSaving: boolean;
  onSave: (data: Data) => void;
};
const SaveContext = createContext<SaveState | null>(null);

export function useEditorSave(initialData: Data, actionUrl: string) {
  const saved = useRef(JSON.stringify(initialData));
  const current = useRef(saved.current);
  const saving = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useUnsavedChanges(dirty || isSaving);

  const onChange = useCallback((data: Data) => {
    current.current = JSON.stringify(data);
    setDirty(current.current !== saved.current);
  }, []);

  const onSave = useCallback(async (data: Data) => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    setSaveError(false);
    const snapshot = JSON.stringify(data);
    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error("Falha ao salvar");
      saved.current = snapshot;
      setDirty(current.current !== snapshot);
    } catch {
      setSaveError(true);
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }, [actionUrl]);

  return { dirty, isSaving, saveError, onChange, onSave };
}

export function EditorSaveProvider({ value, children }: { value: SaveState; children: ReactNode }) {
  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
}

export function EditorSaveButton() {
  const save = useContext(SaveContext);
  const getPuck = useGetPuck();
  if (!save) return null;
  const { dirty, isSaving, onSave } = save;
  return (
    <button
      type="button"
      data-testid="editor-save-button"
      disabled={isSaving}
      onClick={() => onSave(getPuck().appState.data)}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
        dirty
          ? "bg-zinc-900 text-white hover:bg-zinc-800"
          : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {dirty ? <Save className="size-3.5" /> : <Check className="size-3.5" />}
      <span>{isSaving ? "Salvando..." : dirty ? "Salvar" : "Salvo"}</span>
    </button>
  );
}
