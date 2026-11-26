import { useId } from "react";
import {
  CENTERED_CONTENT_WIDTH,
  MAX_CONTENT_WIDTH,
  MIN_CONTENT_WIDTH,
  normalizeLayoutWidth,
  type LayoutWidth,
} from "~/puck/context/visual-layout-context";

const fieldClass = "h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus-visible:outline-2 focus-visible:outline-zinc-600 disabled:opacity-60";

export function LayoutWidthField({
  value,
  onChange,
  readOnly,
}: {
  value: LayoutWidth | undefined;
  onChange: (value: LayoutWidth) => void;
  readOnly?: boolean;
}) {
  const id = useId();
  const width = normalizeLayoutWidth(value);

  return (
    <div className="space-y-2 text-xs">
      <label htmlFor={id} className="block font-medium">Largura do conteúdo</label>
      <select
        id={id}
        className={fieldClass}
        value={width?.mode ?? "legacy"}
        disabled={readOnly}
        onChange={event => {
          const mode = event.currentTarget.value;
          if (mode === "fluid" || mode === "centered") onChange({ mode });
          if (mode === "custom") onChange({ mode, maxWidth: CENTERED_CONTENT_WIDTH });
        }}
      >
        {!width && <option value="legacy" disabled>Layout anterior</option>}
        <option value="fluid">Fluida</option>
        <option value="centered">Centralizada ({CENTERED_CONTENT_WIDTH} px)</option>
        <option value="custom">Personalizada</option>
      </select>
      {width?.mode === "custom" && (
        <div className="space-y-1">
          <label htmlFor={`${id}-max`} className="block font-medium">Largura máxima (px)</label>
          <input
            id={`${id}-max`}
            key={width.maxWidth}
            type="number"
            min={MIN_CONTENT_WIDTH}
            max={MAX_CONTENT_WIDTH}
            step={1}
            defaultValue={width.maxWidth}
            disabled={readOnly}
            className={fieldClass}
            onBlur={event => {
              const input = event.currentTarget;
              const next = normalizeLayoutWidth({ mode: "custom", maxWidth: input.valueAsNumber });
              if (input.value === "" || next?.mode !== "custom") {
                input.value = String(width.maxWidth);
                return;
              }
              input.value = String(next.maxWidth);
              if (next.maxWidth !== width.maxWidth) onChange(next);
            }}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
