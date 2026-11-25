#!/usr/bin/env bash
# Requires agent-browser and an existing dev server with an isolated ACCIO_DATA_DIR.
set -euo pipefail
url=${ACCIO_TEST_URL:-http://127.0.0.1:5199}
session="accio-editor-save-test-$$"
browser() { agent-browser --session "$session" "$@" >/dev/null; }
trap 'agent-browser --session "$session" close >/dev/null 2>&1 || true' EXIT
browser open "$url/"
browser click '[data-testid="create-blank-project"]'
browser wait --url '**/play/*'
browser wait '[data-testid="playground-edit-link"]'
browser click '[data-testid="playground-edit-link"]'
browser wait --url '**/edit'
browser wait '[data-testid="editor-save-button"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvo"'
browser wait --fn 'document.body.innerText.includes("Blocos") && document.body.innerText.includes("Estrutura") && !document.body.innerText.includes("Publish")'
# A later edit made while the first request is pending must remain unsaved.
browser click '[data-testid="header-theme-mode-toggle"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvar"'
browser eval '(() => { const original = window.fetch; window.originalFetch = original; window.fetch = async (...args) => { if (args[1]?.method === "POST") { window.saveHeld = true; await new Promise(resolve => window.releaseSave = resolve); } return original(...args); }; })()'
browser click '[data-testid="editor-save-button"]'
browser wait --fn 'window.saveHeld && document.querySelector("[data-testid=editor-save-button]").disabled && document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvando..."'
browser click '[data-testid="header-theme-mode-toggle"]'
browser eval 'window.confirm = () => { window.inFlightPrompted = true; return false; }'
browser click 'a[href^="/projects/"]:not([href$="/edit"])'
browser wait --fn 'window.inFlightPrompted && location.pathname.endsWith("/edit")'
browser eval 'window.releaseSave()'
browser wait --fn '(() => { const b = document.querySelector("[data-testid=editor-save-button]"); return b && !b.disabled && b.innerText.trim() === "Salvar"; })()'
# A failed request keeps the pending document, exposes an error and permits retry.
browser eval 'window.fetch = (...args) => args[1]?.method === "POST" ? Promise.resolve(new Response("", {status: 500})) : window.originalFetch(...args)'
browser click '[data-testid="editor-save-button"]'
browser wait --fn 'document.querySelector("[role=alert]")?.innerText.includes("Não foi possível salvar") && document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvar"'
browser eval 'window.fetch = window.originalFetch'
browser click '[data-testid="editor-save-button"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvo" && !document.querySelector("[role=alert]")'
# Presenting remains a separate action and still respects the discard guard.
browser click '[data-testid="header-theme-mode-toggle"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvar"'
browser eval 'window.confirm = () => { window.discardPrompted = true; return false; }; window.postCount = 0; window.fetch = (...args) => { if (args[1]?.method === "POST") window.postCount++; return window.originalFetch(...args); }'
browser click 'a[href^="/projects/"]:not([href$="/edit"])'
browser wait --fn 'window.discardPrompted && location.pathname.endsWith("/edit") && window.postCount === 0'
browser eval 'window.confirm = () => true'
browser click 'a[href^="/projects/"]:not([href$="/edit"])'
browser wait --fn '!location.pathname.endsWith("/edit") && location.pathname.startsWith("/projects/") && window.postCount === 0'
# The legacy editor uses the same UI while saving to legacy local pages.
browser open "$url/ux-regressao-$$/edit"
browser wait '[data-testid="editor-save-button"]'
browser wait --fn 'Object.keys(document.querySelector("[data-testid=header-theme-mode-toggle]") || {}).some(key => key.startsWith("__reactProps$"))'
browser click '[data-testid="header-theme-mode-toggle"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvar"'
browser click '[data-testid="editor-save-button"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").innerText.trim() === "Salvo"'
browser open "$url/ux-regressao-$$/edit"
browser wait --fn 'document.querySelector("[data-testid=header-theme-mode-toggle]")?.innerText.trim() === "Dark"'
echo 'Estados de salvamento, concorrência, apresentação e editor legado verificados.'
