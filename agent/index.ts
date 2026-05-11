import path from "node:path";
import fs from "node:fs";
import { readFile, copyBoilerplate } from "./tools/fs.ts";
import { plan } from "./planner.ts";
import { generate } from "./generator.ts";
import { validate } from "./validator.ts";
import { fix } from "./fixer.ts";

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
function parseArgs(argv: string[]): { spec: string; output: string } {
  const args = argv.slice(2);
  let spec = "";
  let output = "./generated-app";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--spec" && args[i + 1]) spec = args[++i]!;
    if (args[i] === "--output" && args[i + 1]) output = args[++i]!;
  }

  if (!spec) {
    console.error("Usage: npx tsx agent/index.ts --spec <path-to-spec> [--output <output-dir>]");
    process.exit(1);
  }

  return { spec, output };
}

// ---------------------------------------------------------------------------
// Remove boilerplate reference files that have no place in the output app.
// These are nested inside src/ so they can't be excluded during the copy.
// ---------------------------------------------------------------------------
function cleanBoilerplate(outputRoot: string): void {
  const toDelete = [
    "src/components/Example.tsx",
    "src/__tests__/Example.test.tsx",
  ];
  for (const relPath of toDelete) {
    const absPath = path.join(outputRoot, relPath);
    if (fs.existsSync(absPath)) fs.rmSync(absPath);
  }
}

// ---------------------------------------------------------------------------
// Patch vitest.config.ts in the output directory.
// The copied config uses __dirname which doesn't resolve reliably in ESM
// when loaded from a subdirectory. Replace it with import.meta.dirname.
// ---------------------------------------------------------------------------
function patchVitestConfig(outputRoot: string): void {
  fs.writeFileSync(
    path.join(outputRoot, "vitest.config.ts"),
    `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  test: {
    root,
    environment: "jsdom",
    globals: true,
    setupFiles: [resolve(root, "src/test-setup.ts")],
  },
});
`,
    "utf-8"
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const { spec: specPath, output: outputArg } = parseArgs(process.argv);

const BOILERPLATE_ROOT = path.resolve(".");
const OUTPUT_ROOT = path.resolve(outputArg);

console.log(`\nSpec:   ${specPath}`);
console.log(`Output: ${OUTPUT_ROOT}\n`);

// Step 1 — Read spec
const spec = readFile(specPath);

// Step 2 — Copy boilerplate → output dir (fresh slate each run)
console.log("Copying boilerplate...");
if (fs.existsSync(OUTPUT_ROOT)) fs.rmSync(OUTPUT_ROOT, { recursive: true });
copyBoilerplate(BOILERPLATE_ROOT, OUTPUT_ROOT);
cleanBoilerplate(OUTPUT_ROOT);
patchVitestConfig(OUTPUT_ROOT);
console.log("Boilerplate ready.\n");

// Step 3 — Plan
const tasks = await plan(spec);

// Step 4 — Generate
const generated = await generate(tasks, BOILERPLATE_ROOT, OUTPUT_ROOT);

// Step 5 — Validate
let result = await validate(OUTPUT_ROOT);

// Step 6 — Fix if needed
if (!result.passed) {
  result = await fix(result, generated, OUTPUT_ROOT);
}

// Step 7 — Summary
console.log("\n" + "=".repeat(50));
if (result.passed) {
  console.log("✓  Generation complete — all checks passed.");
  console.log(`\n   cd ${OUTPUT_ROOT} && npm run dev`);
} else {
  console.log("✗  Generation finished with unresolved errors:");
  console.log(result.errors);
  console.log(`\n   The output is at ${OUTPUT_ROOT} — review errors above.`);
  process.exit(1);
}
console.log("=".repeat(50));
