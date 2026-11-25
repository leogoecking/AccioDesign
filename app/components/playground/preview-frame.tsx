import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { config, EditorModeProvider } from "../../../puck.config";
import { applyThemeToDocument } from "~/theme/apply-theme";
import { normalizeThemeDocument } from "~/theme/schema";

export type PreviewViewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_CONTAINER_CLASS: Record<PreviewViewport, string> = {
  desktop: "w-full h-full",
  tablet:
    "w-[768px] max-w-full h-full rounded-xl border border-zinc-200/90 bg-white shadow-sm",
  mobile:
    "w-[390px] max-w-full h-full rounded-2xl border border-zinc-200/90 bg-white shadow-sm",
};

function syncHeadStyles(parentDoc: Document, iframeDoc: Document) {
  const existingNodes = Array.from(
    iframeDoc.head.querySelectorAll("[data-accio-host-style='true']")
  );
  const existingKeySet = new Set(
    existingNodes.map((node) => node.getAttribute("data-style-key") || "")
  );

  const hostNodes = Array.from(
    parentDoc.head.querySelectorAll('link[rel="stylesheet"], style')
  );

  hostNodes.forEach((node, index) => {
    const id = node.id;
    if (
      id === "puck-css" ||
      id === "accio-tweakcn-theme" ||
      id === "accio-published-theme"
    ) {
      return;
    }

    if (node.tagName === "LINK") {
      const href = (node as HTMLLinkElement).getAttribute("href");
      if (!href) return;
      const key = `link:${href}`;
      if (existingKeySet.has(key)) return;
      const clone = iframeDoc.createElement("link");
      clone.rel = "stylesheet";
      clone.href = href;
      clone.setAttribute("data-accio-host-style", "true");
      clone.setAttribute("data-style-key", key);
      iframeDoc.head.appendChild(clone);
      existingKeySet.add(key);
      return;
    }

    const viteId = node.getAttribute("data-vite-dev-id") || `inline-${index}`;
    const key = `style:${viteId}`;
    const existingMatch = iframeDoc.head.querySelector(
      `[data-style-key="${CSS.escape(key)}"]`
    );
    if (existingMatch) {
      if (existingMatch.textContent !== node.textContent) {
        existingMatch.textContent = node.textContent;
      }
      return;
    }

    const clone = iframeDoc.createElement("style");
    clone.textContent = node.textContent;
    clone.setAttribute("data-accio-host-style", "true");
    clone.setAttribute("data-style-key", key);
    iframeDoc.head.appendChild(clone);
    existingKeySet.add(key);
  });
}

export function PlaygroundPreviewFrame({
  data,
  viewport,
}: {
  data: Data;
  viewport: PreviewViewport;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);

  const themeDoc = normalizeThemeDocument(
    (data.root?.props as { theme?: unknown } | undefined)?.theme
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setupIframeDocument = () => {
      const doc = iframe.contentDocument;
      if (!doc || !doc.head || !doc.body) return;

      if (!doc.head.querySelector('meta[name="viewport"]')) {
        const meta = doc.createElement("meta");
        meta.name = "viewport";
        meta.content = "width=device-width, initial-scale=1";
        doc.head.appendChild(meta);
      }

      syncHeadStyles(document, doc);

      doc.body.className = "m-0 min-h-screen bg-background text-foreground antialiased";

      let rootEl = doc.getElementById("accio-preview-root");
      if (!rootEl) {
        rootEl = doc.createElement("div");
        rootEl.id = "accio-preview-root";
        doc.body.appendChild(rootEl);
      }

      setIframeDoc(doc);
      setMountNode(rootEl);
    };

    setupIframeDocument();
    iframe.addEventListener("load", setupIframeDocument);

    const headObserver = new MutationObserver(() => {
      const doc = iframe.contentDocument;
      if (doc) {
        syncHeadStyles(document, doc);
        applyThemeToDocument(themeDoc, doc);
      }
    });

    headObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      iframe.removeEventListener("load", setupIframeDocument);
      headObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!iframeDoc) return;
    applyThemeToDocument(themeDoc, iframeDoc);
  }, [iframeDoc, themeDoc]);

  return (
    <div className="flex h-full min-h-0 flex-1 items-start justify-center overflow-auto bg-zinc-100/80 p-3 md:p-5">
      <div
        data-testid="playground-viewport-container"
        data-viewport={viewport}
        className={`overflow-hidden transition-[width] duration-200 ease-out ${VIEWPORT_CONTAINER_CLASS[viewport]}`}
      >
        <iframe
          ref={iframeRef}
          title="Pré-visualização da interface"
          data-testid="playground-preview-iframe"
          src="about:blank"
          className="h-full w-full border-0 bg-white"
        />
        {mountNode
          ? createPortal(
              <EditorModeProvider isEditor>
                <Render config={config} data={data} />
              </EditorModeProvider>,
              mountNode
            )
          : null}
      </div>
    </div>
  );
}
