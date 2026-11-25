#!/usr/bin/env bash
# Requires agent-browser and a running server with an isolated ACCIO_DATA_DIR.
set -euo pipefail
url=${ACCIO_TEST_URL:-http://127.0.0.1:5199}
session="accio-export-test-$$"
zip_file=$(mktemp /tmp/accio-export-browser-XXXXXX.zip)
browser() { agent-browser --session "$session" "$@" >/dev/null; }
trap 'agent-browser --session "$session" close >/dev/null 2>&1 || true; rm -f "$zip_file"' EXIT
browser open "$url/"
browser click '[data-testid="create-blank-project"]'
browser wait --url '**/play/*'
browser wait '[data-testid="playground-export-button"]'
browser wait --fn 'Object.keys(document.querySelector("#playground-project-name") || {}).some(key => key.startsWith("__reactProps$"))'
browser fill '#playground-project-name' 'Exportação confirmada'
# Cancel leaves pending changes in place and does not request a ZIP.
browser eval 'window.confirm = () => { window.asked = true; return false; }; window.originalFetch = window.fetch; window.exportCount = 0; window.fetch = (...args) => { if (String(args[0]).endsWith("/export")) window.exportCount++; return window.originalFetch(...args); }'
browser click '[data-testid="playground-export-button"]'
browser wait --fn 'window.asked && window.exportCount === 0 && document.querySelector("#playground-project-name").value === "Exportação confirmada" && document.querySelector("[data-testid=playground-save-button]").innerText.trim() === "Salvar"'
# A failed save must not request the export.
browser eval 'window.confirm = () => true; window.fetch = (...args) => { if (args[1]?.method === "POST") return Promise.resolve(new Response("", {status:500})); if (String(args[0]).endsWith("/export")) window.exportCount++; return window.originalFetch(...args); }'
browser click '[data-testid="playground-export-button"]'
browser wait --fn 'document.querySelector("[role=alert]")?.innerText.includes("Não foi possível salvar") && window.exportCount === 0'
# Confirming saves the current project and downloads the real ZIP.
browser eval 'window.fetch = window.originalFetch'
agent-browser --session "$session" download '[data-testid="playground-export-button"]' "$zip_file" >/dev/null
python3 - "$zip_file" <<'PY'
import json, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
    assert archive.testzip() is None
    assert {name for name in archive.namelist() if "/" not in name} == {'manifest.json', 'design.json', 'tokens.json', 'theme.css', 'DESIGN.md', 'SKILL.md', 'components.md'}
    assert 'frontend/src/main.tsx' in archive.namelist()
    assert archive.read('frontend/src/design.json') == archive.read('design.json')
    assert json.loads(archive.read('manifest.json'))['project']['name'] == 'Exportação confirmada'
PY
# Failed archive request reports an error without mutating the saved project.
browser eval 'window.fetch = (...args) => String(args[0]).endsWith("/export") ? Promise.resolve(new Response("", {status:500})) : window.originalFetch(...args)'
browser click '[data-testid="playground-export-button"]'
browser wait --fn 'document.querySelector("[role=alert]")?.innerText.includes("Não foi possível exportar") && document.querySelector("[data-testid=playground-save-button]").innerText.trim() === "Salvo"'
# Edits made while the ZIP response is pending must never be silently exported.
browser eval 'window.fetch = async (...args) => { const response = await window.originalFetch(...args); if (String(args[0]).endsWith("/export")) { window.exportHeld = true; await new Promise(resolve => window.releaseExport = resolve); } return response; }; window.downloadClicks = 0; HTMLAnchorElement.prototype.click = function() { window.downloadClicks++; };'
browser click '[data-testid="playground-export-button"]'
browser wait --fn 'window.exportHeld === true'
browser fill '#playground-project-name' 'Edição durante exportação'
browser eval 'window.releaseExport()'
browser wait --fn 'document.querySelector("[role=alert]")?.innerText.includes("novas alterações") && document.querySelector("[data-testid=playground-save-button]").innerText.trim() === "Salvar" && window.downloadClicks === 0'
# An edit during save revalidation prevents any export request.
browser eval 'window.confirm = () => true; window.archiveRequests = 0; window.fetch = async (...args) => { const request = String(args[0]?.url ?? args[0]); if (request.endsWith("/export")) window.archiveRequests++; const response = await window.originalFetch(...args); if (request.includes(".data") && (args[1]?.method ?? "GET") === "GET") { window.revalidationHeld = true; await new Promise(resolve => window.releaseRevalidation = resolve); } return response; };'
browser click '[data-testid="playground-export-button"]'
browser wait --fn 'window.revalidationHeld === true'
browser fill '#playground-project-name' 'Edição durante salvamento'
browser eval 'window.releaseRevalidation()'
browser wait --fn '!document.querySelector("[data-testid=playground-save-button]").disabled && document.querySelector("[data-testid=playground-save-button]").innerText.trim() === "Salvar" && window.archiveRequests === 0 && window.downloadClicks === 0'
browser wait --fn 'window.originalFetch("/projects/proj-inexistente/export").then(response => response.status === 404)'
echo 'Exportação: confirmação, falhas, concorrência e ZIP real verificados.'
