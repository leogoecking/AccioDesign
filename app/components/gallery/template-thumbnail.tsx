import type { TemplatePreviewKind } from "~/templates/types";

export function TemplateThumbnail({
  kind,
  accentColor,
}: {
  kind: TemplatePreviewKind;
  accentColor: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[16/10] w-full overflow-hidden border-b border-zinc-200/80 bg-zinc-50 p-3.5"
    >
      <div className="flex h-full w-full overflow-hidden rounded-lg border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Mini sidebar comum aos templates administrativos */}
        <div className="flex w-12 shrink-0 flex-col justify-between border-r border-zinc-200/80 bg-zinc-50/80 p-2">
          <div className="space-y-1.5">
            <div
              className="size-3.5 rounded-[4px]"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-1.5 w-full rounded-full bg-zinc-300/80" />
            <div className="h-1.5 w-4/5 rounded-full bg-zinc-200" />
            <div className="h-1.5 w-3/4 rounded-full bg-zinc-200" />
          </div>
          <div className="size-3 rounded-full bg-zinc-200" />
        </div>

        {/* Conteúdo esquemático específico */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
          {/* Header esquemático */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="h-2 w-20 rounded-full bg-zinc-800/85" />
              <div className="h-1.5 w-28 rounded-full bg-zinc-200" />
            </div>
            <div
              className="h-3.5 w-11 rounded-[4px]"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          {kind === "admin" ? (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded border border-zinc-200/80 bg-zinc-50/70 p-1.5"
                  >
                    <div className="h-1 w-5 rounded-full bg-zinc-300" />
                    <div className="mt-1 h-2 w-7 rounded-full bg-zinc-700/80" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 rounded border border-zinc-200/80 px-2 py-1">
                <div className="h-1.5 w-14 rounded-full bg-zinc-200" />
                <div className="h-2 w-6 rounded-full bg-zinc-300/80" />
                <div className="h-2 w-6 rounded-full bg-zinc-200" />
              </div>
              <div className="flex-1 space-y-1 rounded border border-zinc-200/80 p-1.5">
                <div className="h-1.5 w-full rounded bg-zinc-200/90" />
                <div className="h-1.5 w-full rounded bg-zinc-100" />
                <div className="h-1.5 w-full rounded bg-zinc-100" />
              </div>
            </>
          ) : kind === "dashboard" ? (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded border border-zinc-200/80 bg-zinc-50/70 p-1.5"
                  >
                    <div className="h-1 w-5 rounded-full bg-zinc-300" />
                    <div className="mt-1 h-2 w-8 rounded-full bg-zinc-800/80" />
                  </div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-1.5">
                <div className="flex flex-col justify-between rounded border border-zinc-200/80 p-2">
                  <div className="h-1.5 w-12 rounded-full bg-zinc-300" />
                  <div className="flex items-end gap-1 pt-2">
                    <div className="h-3 w-2 rounded-t bg-zinc-200" />
                    <div className="h-5 w-2 rounded-t bg-zinc-300" />
                    <div
                      className="h-7 w-2 rounded-t"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="h-4 w-2 rounded-t bg-zinc-200" />
                  </div>
                </div>
                <div className="space-y-1.5 rounded border border-zinc-200/80 p-2">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-1.5">
                      <div className="size-2.5 shrink-0 rounded-full bg-zinc-300" />
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-200" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded border border-zinc-200/80 bg-zinc-50/70 px-1.5 py-1"
                  >
                    <div className="h-1.5 w-8 rounded-full bg-zinc-700/75" />
                  </div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((col) => (
                  <div
                    key={col}
                    className="flex flex-col gap-1 rounded bg-zinc-100/90 p-1"
                  >
                    <div className="h-1 w-6 rounded-full bg-zinc-400/70" />
                    <div className="rounded border border-zinc-200/80 bg-white p-1">
                      <div className="h-1 w-full rounded bg-zinc-300" />
                      <div className="mt-1 h-1 w-2/3 rounded bg-zinc-200" />
                    </div>
                    {col < 2 ? (
                      <div className="rounded border border-zinc-200/80 bg-white p-1">
                        <div className="h-1 w-4/5 rounded bg-zinc-300" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
