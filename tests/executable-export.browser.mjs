// Pass the temporary directory printed by tests/executable-export.mjs.
import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const output = path.resolve(process.argv[2]);
const projects = JSON.parse(await fs.readFile(path.join(output, "projects.json"), "utf8"));
const capture = path.join(output, "capturas");
await fs.mkdir(capture, { recursive: true });
const session = `accio-executable-${process.pid}`;
const browser = (...args) => execFileSync("agent-browser", ["--session", session, ...args], { encoding: "utf8" }).trim();

const describeView = `(async () => {
  await document.fonts.ready;
  const scope = document.querySelector("[data-accio-theme]");
  const css = getComputedStyle(scope);
  return {
    mode: scope.dataset.themeMode,
    htmlDark: document.documentElement.classList.contains("dark"),
    navigation: scope.dataset.navigationMode,
    density: scope.dataset.density,
    text: scope.textContent.replace(/\\s+/g, " ").trim(),
    background: css.backgroundColor,
    foreground: css.color,
    font: css.fontFamily,
    spacing: parseFloat(css.getPropertyValue("--spacing")),
    radius: parseFloat(css.getPropertyValue("--radius")),
    viewport: [innerWidth, innerHeight],
  };
})()`;

try {
  const measurements = [];
  for (const [index, project] of projects.entries()) {
    const port = String(5210 + index);
    const exported = `http://127.0.0.1:${port}/`;
    const server = spawn("node", [
      "node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", port, "--strictPort",
    ], { cwd: project.frontend, stdio: "ignore" });
    try {
      const deadline = Date.now() + 10000;
      while (true) {
        const ready = await fetch(exported).then(response => response.ok, () => false);
        if (ready) break;
        if (Date.now() >= deadline) throw new Error(`Vite preview indisponível em ${exported}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
        browser("open", project.original);
        browser("set", "viewport", String(width), String(height));
        browser("wait", "--fn", `document.querySelector("[data-accio-theme]")?.dataset.themeMode === "${project.mode}" && document.documentElement.classList.contains("dark") === ${project.mode === "dark"}`);
        const originalMetrics = JSON.parse(browser("eval", describeView));
        const originalName = path.join(capture, `${project.template}-${width}-original.png`);
        browser("screenshot", originalName);
        browser("open", exported);
        browser("wait", "[data-accio-theme]");
        const exportMetrics = JSON.parse(browser("eval", describeView));
        assert.equal(browser("eval", "performance.getEntriesByType('resource').every(entry => new URL(entry.name).origin === location.origin)"), "true");
        assert.deepEqual(exportMetrics, originalMetrics, `${project.template} ${width}px`);
        assert.equal(exportMetrics.navigation, project.navigation);
        assert.equal(exportMetrics.density, project.density);
        assert.equal(exportMetrics.mode, project.mode);
        const exportName = path.join(capture, `${project.template}-${width}-exportado.png`);
        browser("screenshot", exportName);
        const pixelDiff = spawnSync("magick", ["compare", "-metric", "AE", originalName, exportName, "null:"], { encoding: "utf8" });
        if (pixelDiff.status !== 0 && pixelDiff.status !== 1) throw new Error(pixelDiff.stderr);
        measurements.push({ template: project.template, width, height, differentPixels: pixelDiff.stderr.trim() });
        console.log(project.template, width, pixelDiff.stderr.trim());
      }
      if (project.template === "sistema-administrativo") {
        const search = 'input[placeholder="Filtrar registros exibidos..."]';
        const initialRows = Number(browser("eval", 'document.querySelectorAll("tbody tr").length'));
        assert.ok(initialRows > 1);
        browser("fill", search, "Horizonte");
        browser("wait", "--fn", `(() => {
          const rows = [...document.querySelectorAll("tbody tr")];
          return rows.length === 1 && rows[0].textContent.includes("Horizonte Logística");
        })()`);
        browser("press", "Control+a");
        browser("press", "Backspace");
        browser("wait", "--fn", `document.querySelectorAll("tbody tr").length === ${initialRows}`, "--timeout", "5000");
        console.log("Filtro demonstrativo verificado no frontend independente");
      }
    } finally {
      server.kill();
    }
  }
  await fs.writeFile(path.join(capture, "comparacao.json"), JSON.stringify(measurements, null, 2) + "\n");
} finally {
  browser("close");
}
