import { useCallback, useEffect, type RefObject } from "react";
import { useBeforeUnload, useBlocker } from "react-router";

export const UNSAVED_MESSAGE = "Há alterações não salvas. Deseja descartá-las?";

export function useUnsavedChanges(dirty: boolean, bypass?: RefObject<boolean>) {
  const blocker = useBlocker(useCallback(() => dirty && !bypass?.current, [dirty, bypass]));
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  }, [dirty]));
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm(UNSAVED_MESSAGE)) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
}
