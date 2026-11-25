#!/usr/bin/env bash
# Requires agent-browser and an existing dev server with an isolated ACCIO_DATA_DIR.
set -euo pipefail
url=${ACCIO_TEST_URL:-http://127.0.0.1:5199}
session="accio-navigation-test-$$"
browser() { agent-browser --session "$session" "$@" >/dev/null; }
trap 'agent-browser --session "$session" close >/dev/null 2>&1 || true' EXIT
browser open "$url/"
browser click '[data-testid="create-blank-project"]'
browser wait --url '**/play/*'
browser wait '#playground-project-name'
browser eval 'window.confirm = (message) => { window.confirmation = message; return false; }'
browser fill '#playground-project-name' 'Nome pendente'
browser wait --fn '(() => { const event = new Event("beforeunload", {cancelable: true}); window.dispatchEvent(event); return event.defaultPrevented; })()'
browser click 'a[href="/"]'
browser wait --fn 'window.confirmation && location.pathname.startsWith("/play/") && document.querySelector("#playground-project-name").value === "Nome pendente"'
# The existing transition to the editor saves before navigating.
browser click '[data-testid="playground-edit-link"]'
browser wait --url '**/edit'
browser wait --fn 'document.body.innerText.includes("Nome pendente")'
browser eval 'window.confirmation = undefined; window.confirm = (message) => { window.confirmation = message; return false; }'
browser click '[data-testid="header-theme-mode-toggle"]'
browser click 'a[href^="/play/"]'
browser wait --fn 'window.confirmation && location.pathname.endsWith("/edit")'
browser eval 'window.confirm = () => true'
browser click 'a[href^="/play/"]'
browser wait --url '**/play/*'
# Hold the loader response after the save and edit while revalidation is pending.
browser wait '#playground-project-name'
browser eval '(() => { const original = window.fetch; window.fetch = async (...args) => { const response = await original(...args); const request = args[0]; const url = String(request.url ?? request); const method = args[1]?.method ?? request.method ?? "GET"; if (url.includes(".data") && method.toUpperCase() === "GET" && !window.revalidationHeld) { window.revalidationHeld = true; await new Promise(resolve => { window.releaseRevalidation = resolve; }); } return response; }; })()'
browser fill '#playground-project-name' 'Primeira revisão'
browser click '[data-testid="playground-edit-link"]'
browser wait --fn 'window.revalidationHeld === true' --timeout 5000
browser fill '#playground-project-name' 'Revisão posterior'
browser eval 'window.releaseRevalidation()'
browser wait --fn '(() => { const save = document.querySelector("[data-testid=playground-save-button]"); return save && !save.disabled; })()'
browser wait --fn 'location.pathname.startsWith("/play/") && document.querySelector("#playground-project-name").value === "Revisão posterior" && document.querySelector("[data-testid=playground-save-button]").innerText.trim() === "Salvar"' --timeout 3000
browser click '[data-testid="playground-edit-link"]'
browser wait --url '**/edit'
browser wait --fn 'document.body.innerText.includes("Revisão posterior")'
echo 'Navegação e edição durante a revalidação verificadas.'
