/**
 * Adapted from Spell UI `copy-button` (https://github.com/xxtomm/spell-ui)
 * Licensed under the MIT License (see app/export/licenses/LICENSE-SPELLUI-MIT.txt).
 *
 * Modifications for AccioDesign:
 * - Removed `motion/react` dependency in favor of lightweight CSS transitions respecting
 *   `prefers-reduced-motion`.
 * - Added explicit `"error"` state so failed clipboard operations never report false success.
 * - Added `aria-live="polite"` feedback, keyboard focus styles, semantic tokens, and callbacks.
 */
import * as React from "react";
import { AlertCircle, Check, Copy } from "lucide-react";
import { cn } from "cn";

export type CopyStatus = "idle" | "copied" | "error";

export interface CopyButtonProps {
  value: string;
  label?: string;
  size?: "sm" | "default";
  className?: string;
  onCopySuccess?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
}

async function copyTextSafe(text: string): Promise<boolean> {
  if (!text) return false;

  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback via textarea below when clipboard permission/API rejects
    }
  }

  if (typeof document === "undefined" || !document.body) {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    const ok =
      typeof document.execCommand === "function" &&
      document.execCommand("copy");
    return Boolean(ok);
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function CopyButton({
  value,
  label,
  size = "sm",
  className,
  onCopySuccess,
  onCopyError,
}: CopyButtonProps) {
  const [status, setStatus] = React.useState<CopyStatus>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      const ok = await copyTextSafe(value);
      if (ok) {
        setStatus("copied");
        onCopySuccess?.(value);
      } else {
        setStatus("error");
        onCopyError?.(new Error("Não foi possível copiar para a área de transferência."));
      }
    } catch (error) {
      setStatus("error");
      onCopyError?.(error);
    }
    scheduleReset();
  };

  const accessibleLabel =
    status === "copied"
      ? "Copiado para a área de transferência"
      : status === "error"
        ? "Não foi possível copiar"
        : label || `Copiar ${value}`;

  return (
    <button
      type="button"
      data-slot="copy-button"
      data-copy-status={status}
      onClick={handleCopy}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
        size === "sm" ? "size-7" : "size-8",
        status === "copied" && "border-primary/40 bg-primary/10 text-primary",
        status === "error" &&
          "border-destructive/50 bg-destructive/10 text-destructive hover:text-destructive",
        className
      )}
    >
      {status === "copied" ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : status === "error" ? (
        <AlertCircle className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {status === "copied"
          ? "Copiado para a área de transferência"
          : status === "error"
            ? "Não foi possível copiar"
            : ""}
      </span>
    </button>
  );
}
