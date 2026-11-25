import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const outDir = path.join(repoRoot, ".cache", `accio-tests-${process.pid}`);
const outFile = path.join(outDir, "phase3.test.mjs");

try {
  await build({
    absWorkingDir: repoRoot,
    entryPoints: ["tests/phase3.test.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outfile: outFile,
    plugins: [{
      name: "vite-raw-imports",
      setup(builder) {
        builder.onResolve({ filter: /\?raw$/ }, args => ({
          path: path.resolve(args.resolveDir, args.path.slice(0, -4)),
          namespace: "raw",
        }));
        builder.onLoad({ filter: /.*/, namespace: "raw" }, args => ({
          contents: fs.readFileSync(args.path, "utf8"),
          loader: "text",
        }));
      },
    }],
  });

  execFileSync(process.execPath, ["--test", outFile], {
    cwd: repoRoot,
    stdio: "inherit",
  });
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
