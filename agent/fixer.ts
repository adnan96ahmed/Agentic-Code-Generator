import path from "node:path";
import { chat } from "./tools/llm.ts";
import { readFile, writeFile } from "./tools/fs.ts";
import { validate, type ValidationResult } from "./validator.ts";
import { FIX_SYSTEM_PROMPT, buildFixUserPrompt } from "./prompts/fixPrompt.ts";
import type { GeneratedFile } from "./generator.ts";

const MAX_RETRIES = 2;

/**
 * Strips markdown code fences if the LLM wraps its output in them.
 */
function stripFences(raw: string): string {
  return raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
}

/**
 * Extracts file paths mentioned in error output.
 * Matches patterns like: src/hooks/useCars.ts or src/components/CarCard.tsx
 */
function extractErroredFiles(errors: string, generatedFiles: GeneratedFile[]): GeneratedFile[] {
  return generatedFiles.filter((f) => errors.includes(f.path));
}

export async function fix(
  result: ValidationResult,
  generatedFiles: GeneratedFile[],
  outputRoot: string
): Promise<ValidationResult> {
  let current = result;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (current.passed) break;

    console.log(`\nFix attempt ${attempt}/${MAX_RETRIES}...`);
    console.log("Errors:\n", current.errors.slice(0, 800));

    // Find which generated files are mentioned in the error output
    const toFix = extractErroredFiles(current.errors, generatedFiles);

    if (toFix.length === 0) {
      // No specific files identified — fix all generated files as a fallback
      console.log("  No specific files identified in errors, attempting fix on all generated files.");
      toFix.push(...generatedFiles);
    }

    console.log(`  Fixing ${toFix.length} file(s): ${toFix.map((f) => f.path).join(", ")}`);

    for (const file of toFix) {
      const absPath = path.join(outputRoot, file.path);
      let currentContent: string;
      try {
        currentContent = readFile(absPath);
      } catch {
        console.warn(`  Could not read ${absPath}, skipping.`);
        continue;
      }

      const raw = await chat(
        [
          { role: "system", content: FIX_SYSTEM_PROMPT },
          { role: "user", content: buildFixUserPrompt(file.path, currentContent, current.errors) },
        ],
        "gpt-4o"
      );

      const fixed = stripFences(raw);
      writeFile(absPath, fixed);

      // Update the in-memory record so subsequent fix attempts have fresh content
      file.content = fixed;
      console.log(`  Patched: ${file.path}`);
    }

    console.log("  Re-validating...");
    current = await validate(outputRoot);
  }

  return current;
}
