import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, ".cache", `accio-tests-${process.pid}`);
const outFile = path.join(outDir, "phase3.test.mjs");

fs.mkdirSync(outDir, { recursive: true });

try {
  execFileSync(
    path.join(repoRoot, "node_modules", ".bin", "esbuild"),
    [
      path.join(repoRoot, "tests", "phase3.test.ts"),
      "--bundle",
      "--platform=node",
      "--format=esm",
      "--packages=external",
      `--outfile=${outFile}`,
    ],
    {
      cwd: repoRoot,
      stdio: "inherit",
    }
  );

  execFileSync(process.execPath, ["--test", outFile], {
    cwd: repoRoot,
    stdio: "inherit",
  });
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
