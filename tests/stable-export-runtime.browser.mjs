// Start AccioDesign on port 5199 with a temporary ACCIO_DATA_DIR before running.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";

const base = process.env.ACCIO_TEST_URL ?? "http://127.0.0.1:5199";
const directory = await fs.mkdtemp(path.join(os.tmpdir(), "accio-stable-slot-"));
const frontend = path.join(directory, "frontend");
const created = await fetch(new URL("/?index", base), {
  method: "POST",
  body: new URLSearchParams({ intent: "create", templateId: "em-branco" }),
  redirect: "manual",
});
const play = created.headers.get("location");
assert.match(play, /^\/play\/proj-/);
const exportUrl = new URL(`/projects/${play.split("/").at(-1)}/export`, base);

async function archive() {
  const response = await fetch(exportUrl);
  assert.equal(response.status, 200);
  return JSZip.loadAsync(await response.arrayBuffer(), { checkCRC32: true });
}

const design = JSON.parse(await (await archive()).file("design.json").async("string"));
const divider = (id, label) => ({ type: "Divider", props: { id, label } });
const form = {
  type: "FormBlock",
  props: {
    id: "formulario",
    layout: "card",
    form: {
      title: "Formulário inicial", action: "#", method: "get",
      fields: [{ name: "nome", label: "Nome", type: "text" }],
      button: { label: "Enviar" },
    },
  },
};
const details = {
  id: "detalhes", label: "Detalhes", content: [divider("a", "Bloco A"), form, divider("b", "Bloco B")],
};
const summary = { id: "resumo", label: "Resumo", content: [divider("resumo", "Dados do resumo")] };
design.content = [{
  type: "DashboardGrid",
  props: {
    id: "grade", columns: "1",
    items: [{ type: "TabsSection", props: { id: "abas", tabs: [summary, details] } }],
  },
}];

const saved = await fetch(new URL(play, base), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: design }),
});
assert.equal(saved.status, 200);
const zip = await archive();
for (const file of Object.values(zip.files)) {
  if (!file.name.startsWith("frontend/") || file.dir) continue;
  const target = path.join(directory, file.name);
  assert.ok(target.startsWith(frontend + path.sep));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, await file.async("nodebuffer"));
}
console.log(`Frontend extraído em ${frontend}`);

const update = structuredClone(design);
update.content[0].props.sectionTitle = "Documento atualizado";
const updateTabs = update.content[0].props.items[0].props.tabs;
updateTabs[1].content[1].props.form.title = "Formulário atualizado";
const reordered = structuredClone(update);
const reorderTabs = reordered.content[0].props.items[0].props.tabs;
reorderTabs.reverse();
reorderTabs[0].content.reverse();
const edited = structuredClone(reordered);
const editTabs = edited.content[0].props.items[0].props.tabs;
editTabs[0].content.shift();
editTabs[0].content.unshift(divider("c", "Bloco C"));
editTabs[1] = { id: "novo", label: "Nova aba", content: [divider("novo", "Conteúdo da nova aba")] };

const main = path.join(frontend, "src/main.tsx");
const source = await fs.readFile(main, "utf8");
const renderIndex = source.indexOf("createRoot(document.getElementById");
assert.ok(renderIndex >= 0);
// Exercise the exported registry and views with an external data source.
await fs.writeFile(main, source.slice(0, renderIndex) + `
const target = createRoot(document.getElementById("root")!);
const updates = ${JSON.stringify([update, reordered, edited])};
const render = (snapshot: typeof data) => {
  target.render(<DesignView data={snapshot} registry={registry} theme={{ activeMode: "light", presetId: "default" }} />);
};
let updateIndex = 0;
document.addEventListener("fixture:update", () => {
  render(updates[updateIndex++] as typeof data);
});
render(data);
`);
for (const args of [["install", "--no-audit", "--no-fund"], ["run", "typecheck"], ["run", "build"]]) {
  const output = execFileSync("npm", args, { cwd: frontend, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  await fs.writeFile(path.join(directory, `npm-${args[0] === "install" ? "install" : args[1]}.log`), output);
  console.log(`OK npm ${args.join(" ")}`);
}

const port = process.env.ACCIO_RUNTIME_TEST_PORT ?? "5230";
const url = `http://127.0.0.1:${port}/`;
const server = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", port, "--strictPort"], {
  cwd: frontend,
  stdio: "ignore",
});
const session = `accio-slot-${process.pid}`;
const browser = (...args) => execFileSync("agent-browser", ["--session", session, ...args], { encoding: "utf8" }).trim();
const textNode = label => `[...document.querySelectorAll("span")].find(node => node.textContent === ${JSON.stringify(label)})`;
const input = 'document.querySelector("input[name=nome]")';
const check = stage => {
  const state = JSON.parse(browser("eval", `({
    mesmoCampo: ${input} === window.initialField,
    foco: document.activeElement === ${input},
    valor: ${input}?.value,
    aba: document.querySelector('[role=tab][aria-selected=true]')?.textContent,
    mesmoBlocoA: ${textNode("Bloco A")} === window.initialA,
  })`));
  console.log(stage, state);
  assert.deepEqual(state, {
    mesmoCampo: true, foco: true, valor: "Conteúdo digitado", aba: "Detalhes", mesmoBlocoA: true,
  });
};
const advance = () => browser("eval", 'document.dispatchEvent(new Event("fixture:update"))');
try {
  const deadline = Date.now() + 10000;
  while (!(await fetch(url).then(response => response.ok, () => false))) {
    if (Date.now() >= deadline) throw new Error("Frontend independente indisponível");
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser("open", url);
  browser("find", "role", "tab", "click", "--name", "Detalhes");
  browser("fill", "input[name=nome]", "Conteúdo digitado");
  browser("eval", `window.initialField = ${input}; window.initialA = ${textNode("Bloco A")}; true`);
  assert.equal(browser("eval", "Boolean(window.initialField && window.initialA)"), "true");
  check("Estado inicial");

  advance();
  browser("wait", "--text", "Documento atualizado", "--timeout", "5000");
  check("Atualização dos dados aninhados");
  browser("wait", "--text", "Formulário atualizado", "--timeout", "5000");

  advance();
  browser("wait", "--fn", `${textNode("Bloco B")}.compareDocumentPosition(${textNode("Bloco A")}) & Node.DOCUMENT_POSITION_FOLLOWING`, "--timeout", "5000");
  assert.equal(browser("eval", 'document.querySelector("[role=tab]").textContent === "Detalhes"'), "true");
  check("Reordenação de blocos e abas");

  advance();
  browser("wait", "--fn", `Boolean(${textNode("Bloco C")})`, "--timeout", "5000");
  assert.equal(browser("eval", `Boolean(${textNode("Bloco B")})`), "false");
  assert.equal(browser("eval", 'Boolean([...document.querySelectorAll("[role=tab]")].find(tab => tab.textContent === "Resumo"))'), "false");
  check("Inclusão e remoção de blocos e slots");

  browser("find", "role", "tab", "click", "--name", "Nova aba");
  browser("wait", "--fn", `Boolean(${textNode("Conteúdo da nova aba")})`, "--timeout", "5000");
} finally {
  server.kill();
  browser("close");
}
