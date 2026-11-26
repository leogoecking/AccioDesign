#!/usr/bin/env bash
# Requires an AccioDesign server with an isolated ACCIO_DATA_DIR.
set -euo pipefail
url=${ACCIO_TEST_URL:-http://127.0.0.1:5199}
session="accio-width-controls-$$"
browser() { agent-browser --session "$session" "$@" >/dev/null; }
trap 'agent-browser --session "$session" close >/dev/null 2>&1 || true' EXIT
browser open "$url/"
browser set viewport 1920 1080
browser click '[data-testid="create-blank-project"]'
browser wait --url '**/play/*'
browser wait '[data-testid="playground-save-button"]'
browser find role button click --name 'Estrutura e estilo'
selector='select:has(option[value="custom"])'
browser select "$selector" custom
browser fill 'input[type=number][min="320"]' 1120
browser press Tab
browser wait --fn 'document.querySelector("iframe")?.contentDocument.querySelector(".accio-page-content")?.style.maxInlineSize === "1120px"'
browser click '[data-testid="playground-edit-link"]'
browser wait --url '**/edit'
browser wait --fn 'document.querySelector("select:has(option[value=custom])")?.value === "custom" && document.querySelector("input[type=number][min=\"320\"]")?.value === "1120"'
browser wait --fn '[...document.querySelectorAll("iframe")].some(frame => frame.contentDocument?.querySelector(".accio-page-content")?.style.maxInlineSize === "1120px")'
browser select "$selector" centered
browser wait --fn '[...document.querySelectorAll("iframe")].some(frame => frame.contentDocument?.querySelector(".accio-page-content")?.style.maxInlineSize === "1440px")'
browser wait '[data-testid="editor-save-button"]'
browser click '[data-testid="editor-save-button"]'
browser wait --fn 'document.querySelector("[data-testid=editor-save-button]").textContent.trim() === "Salvo"'
browser find role link click --name 'Apresentar'
browser wait --fn 'document.querySelector("[data-accio-width]")?.dataset.accioWidth === "centered" && document.querySelector(".accio-page-content").getBoundingClientRect().width === 1440'
echo 'Largura personalizada e centralizada verificadas nos controles, no documento salvo e na apresentação.'
