// Run after ACCIO_TEST_RESPONSIVE=1 node tests/executable-export.mjs.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const directory = path.resolve(process.argv[2]);
const projects = JSON.parse(await fs.readFile(path.join(directory, "projects.json"), "utf8"));
assert.equal(projects.length, 5);
const viewports = [[390, 844], [768, 1024], [1366, 768], [1920, 1080], [2560, 1440], [3440, 1440]];
const session = `accio-responsive-${process.pid}`;
const browser = (...args) => execFileSync("agent-browser", ["--session", session, ...args], { encoding: "utf8" }).trim();
const documentFor = framed => framed
  ? '[...document.querySelectorAll("iframe")].map(frame => frame.contentDocument).find(doc => doc?.querySelector("[data-accio-width]"))'
  : "document";

const readLayout = framed => `(() => {
  const doc = ${documentFor(framed)};
  const root = doc?.querySelector("[data-accio-width]");
  if (!root) return null;
  const page = root.querySelector(".accio-page-content");
  const shell = root.querySelector(".accio-navigation-frame");
  const visible = selector => Boolean(shell?.querySelector(selector)?.getClientRects().length);
  const boxes = [...root.querySelectorAll(".accio-section, .accio-navigation-frame, [data-testid=app-sidebar-shell] main, [role=tablist]")];
  const box = page.getBoundingClientRect();
  const viewport = doc.documentElement.clientWidth;
  return {
    viewport, width: box.width, widthMode: root.dataset.accioWidth,
    centered: Math.abs(box.left - (viewport - box.width) / 2) <= 2,
    documentOverflow: doc.documentElement.scrollWidth - viewport,
    pageOverflow: page.scrollWidth - page.clientWidth,
    overflownBoxes: boxes.filter(box => box.scrollWidth - box.clientWidth > 2)
      .map(box => ({ name: box.className, overflow: box.scrollWidth - box.clientWidth })),
    tablesScrolling: [...root.querySelectorAll("[data-slot=table-container]")]
      .some(box => box.scrollWidth > box.clientWidth),
    formWidth: root.querySelector(".accio-form-split")?.getBoundingClientRect().width,
    mode: root.dataset.themeMode, density: root.dataset.density, navigation: root.dataset.navigationMode,
    shellWidth: shell?.clientWidth,
    mobileNav: visible('[aria-label="Navegação principal"]'),
    sidebar: visible('[data-slot="sidebar"]'),
    rail: visible('[aria-label="Navegação compacta"]'),
    topNav: visible('[aria-label="Navegação superior"]'),
    gridColumns: root.querySelector(".grid-cols-1")?.ownerDocument.defaultView
      .getComputedStyle(root.querySelector(".grid-cols-1")).gridTemplateColumns,
    blocks: [...root.querySelectorAll("[data-puck-component]")].map(node => node.dataset.puckComponent),
    samePage: window.responsivePage === page,
  };
})()`;

async function checkRoute(project, name, url, measurements) {
  const framed = name === "Experimentar" || name === "Editar";
  const frameDoc = documentFor(framed);
  browser("set", "viewport", "1366", "768");
  browser("open", url);
  browser("wait", "--fn", `Boolean((${frameDoc})?.querySelector(".accio-page-content"))`);
  if (name === "Experimentar") browser("click", '[data-testid="playground-toggle-controls"]');
  if (name === "Editar") {
    const name = "Mudar para visualização Largura total";
    const button = `document.querySelector('button[aria-label="${name}"]')`;
    if (browser("eval", `${button}.disabled`) === "false") {
      browser("find", "role", "button", "click", "--name", name);
    }
    browser("wait", "--fn", `${button}?.disabled && Boolean((${frameDoc})?.querySelector(".accio-page-content"))`);
  }
  browser("eval", `window.responsivePage = (${frameDoc}).querySelector(".accio-page-content"); true`);

  for (const [width, height] of viewports) {
    browser("set", "viewport", String(width), String(height));
    browser("wait", "--fn", `(async () => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return innerWidth === ${width} && innerHeight === ${height};
    })()`);
    const result = JSON.parse(browser("eval", readLayout(framed)));
    const at = `${project.template} · ${name} · ${width}×${height}`;
    assert.ok(result, at);
    assert.equal(result.widthMode, project.layoutWidth.mode, at);
    assert.equal(result.mode, project.mode, at);
    assert.equal(result.density, project.density, at);
    assert.equal(result.navigation, project.navigation, at);
    const limit = project.layoutWidth.mode === "centered" ? 1440 : project.layoutWidth.maxWidth ?? Infinity;
    assert.ok(Math.abs(result.width - Math.min(result.viewport, limit)) <= 2, `${at} largura: ${JSON.stringify(result)}`);
    assert.ok(result.centered, at);
    assert.ok(result.documentOverflow <= 2 && result.pageOverflow <= 2, `${at} overflow: ${JSON.stringify(result)}`);
    assert.deepEqual(result.overflownBoxes, [], at);
    assert.ok(result.samePage, `${at} remontou o layout ao redimensionar`);
    if (result.shellWidth) {
      assert.equal(result.topNav, project.navigation === "topnav", at);
      if (width === 390) {
        assert.equal(result.mobileNav, project.navigation !== "topnav", `${at} ${JSON.stringify(result)}`);
        assert.ok(!result.sidebar && !result.rail, at);
      }
      if (width === 3440) {
        assert.equal(result.sidebar, project.navigation === "sidebar", at);
        assert.equal(result.rail, project.navigation === "rail", at);
        assert.ok(!result.mobileNav, at);
      }
    }
    if (project.template === "catalogo" && name === "Editar") {
      assert.equal(new Set(result.blocks.filter(id => id.startsWith("catalog-"))).size, 20, at);
    }
    if (project.template === "catalogo" && (name === "Apresentar" || name === "Exportado")) {
      if (width === 390) {
        assert.equal(result.gridColumns.split(" ").length, 1, at);
        assert.ok(result.tablesScrolling, `${at} tabela sem rolagem local`);
      }
      if (width === 3440) assert.equal(result.gridColumns.split(" ").length, 4, at);
    }
    if (result.formWidth !== undefined) assert.ok(result.formWidth <= 1024, `${at} formulário excedeu o limite local`);
    measurements.push({ template: project.template, environment: name, windowWidth: width, windowHeight: height, ...result });
  }
  console.log(`${project.template} · ${name} · 6 tamanhos`);
}

const results = [];
try {
  for (const [index, project] of projects.entries()) {
    const port = String(5240 + index);
    const exported = `http://127.0.0.1:${port}/`;
    const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", port, "--strictPort"], {
      cwd: project.frontend, stdio: "ignore",
    });
    try {
      const deadline = Date.now() + 10000;
      while (!(await fetch(exported).then(r => r.ok, () => false))) {
        if (Date.now() >= deadline) throw new Error(`Frontend indisponível em ${exported}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const play = new URL(`/play/${project.id}`, project.original).href;
      await checkRoute(project, "Experimentar", play, results);
      await checkRoute(project, "Editar", `${project.original}/edit`, results);
      await checkRoute(project, "Apresentar", project.original, results);
      await checkRoute(project, "Exportado", exported, results);
      for (const [width, height] of viewports) {
        const pair = results.filter(item => item.template === project.template && item.windowWidth === width && item.windowHeight === height);
        const [published, standalone] = pair.filter(item => ["Apresentar", "Exportado"].includes(item.environment));
        assert.equal(published.width, standalone.width);
        assert.equal(published.gridColumns, standalone.gridColumns);
        assert.equal(published.tablesScrolling, standalone.tablesScrolling);
        assert.equal(published.formWidth, standalone.formWidth);
      }
    } finally {
      server.kill();
    }
  }
} finally {
  await fs.writeFile(path.join(directory, "responsividade.json"), JSON.stringify(results, null, 2) + "\n");
  browser("close");
}
