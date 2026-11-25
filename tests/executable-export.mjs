// Run against an AccioDesign server started with a temporary ACCIO_DATA_DIR.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";

const base = process.env.ACCIO_TEST_URL ?? "http://127.0.0.1:5199";
const output = await fs.mkdtemp(path.join(os.tmpdir(), "accio-frontend-"));
console.log(output);

const variants = [
  ["sistema-administrativo", "light", "sidebar", "default"],
  ["dashboard-operacional", "dark", "rail", "compact"],
  ["central-atendimento", "dark", "topnav", "comfortable"],
  ["em-branco", "light", "sidebar", "default"],
];

async function fetchZip(id) {
  const response = await fetch(`${base}/projects/${id}/export`);
  assert.equal(response.status, 200);
  const bytes = Buffer.from(await response.arrayBuffer());
  return { bytes, zip: await JSZip.loadAsync(bytes, { checkCRC32: true }) };
}

const projects = [];
for (const [template, mode, navigation, density] of variants) {
  const created = await fetch(new URL("/?index", base), {
    method: "POST",
    body: new URLSearchParams({ intent: "create", templateId: template }),
    redirect: "manual",
  });
  const play = created.headers.get("location");
  assert.match(play, /^\/play\/proj-/);
  const id = play.split("/").at(-1);
  const { zip: original } = await fetchZip(id);
  const design = JSON.parse(await original.file("design.json").async("string"));
  Object.assign(design.root.props, { navigationMode: navigation, density });
  design.root.props.theme.activeMode = mode;
  if (density !== "default") {
    const spacing = density === "compact" ? "0.21rem" : "0.29rem";
    design.root.props.theme.tokens.light.spacing = spacing;
    design.root.props.theme.tokens.dark.spacing = spacing;
  }
  const saved = await fetch(`${base}${play}`, {
    method: "POST", body: JSON.stringify({ data: design }), headers: { "Content-Type": "application/json" },
  });
  assert.equal(saved.status, 200);


  const directory = path.join(output, template);
  await fs.mkdir(directory);
  const { bytes, zip } = await fetchZip(id);
  const archivePath = path.join(directory, "design.zip");
  await fs.writeFile(archivePath, bytes);
  execFileSync("unzip", ["-q", archivePath, "-d", directory]);
  const frontend = path.join(directory, "frontend");
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(frontend, "src/design.json"), "utf8")), design);
  const tokens = JSON.parse(await zip.file("tokens.json").async("string"));
  assert.deepEqual(tokens.modes, design.root.props.theme.tokens);
  assert.equal(tokens.activeMode, mode);
  assert.equal(await zip.file("theme.css").async("string"), await fs.readFile(path.join(frontend, "src/theme.css"), "utf8"));
  const pkg = JSON.parse(await fs.readFile(path.join(frontend, "package.json"), "utf8"));
  assert.ok(!pkg.dependencies["@puckeditor/core"]);
  assert.ok(await fs.stat(path.join(frontend, "licenses/LICENSE-SHADCN-MIT.txt")));

  for (const args of [["install", "--no-audit", "--no-fund"], ["run", "typecheck"], ["run", "build"]]) {
    const result = spawnSync("npm", args, { cwd: frontend, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    const log = path.join(directory, `npm-${args[0] === "install" ? "install" : args[1]}.log`);
    await fs.writeFile(log, result.stdout + result.stderr);
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `Falha em ${template}. Consulte ${log}`);
    console.log(template, args.join(" "));
  }
  projects.push({ template, id, mode, navigation, density, frontend, original: `${base}/projects/${id}` });
  await fs.writeFile(path.join(output, "projects.json"), JSON.stringify(projects, null, 2));
}
