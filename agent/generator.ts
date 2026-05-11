import path from "node:path";
import { chat } from "./tools/llm.ts";
import { readFile, writeFile } from "./tools/fs.ts";
import { CODEGEN_SYSTEM_PROMPT, buildCodegenUserPrompt } from "./prompts/codegenPrompt.ts";
import type { Task } from "./planner.ts";

/**
 * Strips markdown code fences if the LLM wraps its output in them.
 * e.g. ```typescript\n...\n``` → just the code inside.
 */
function stripFences(raw: string): string {
  return raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export async function generate(
  tasks: Task[],
  boilerplateRoot: string,
  outputRoot: string
): Promise<GeneratedFile[]> {
  const generated: GeneratedFile[] = [];

  for (const task of tasks) {
    console.log(`\nGenerating [${task.id}]: ${task.outputFile}`);

    // Read boilerplate context files for this specific task
    const contextFiles = task.contextFiles.flatMap((relPath) => {
      const absPath = path.join(boilerplateRoot, relPath);
      try {
        return [{ path: relPath, content: readFile(absPath) }];
      } catch {
        console.warn(`  Warning: context file not found: ${relPath}`);
        return [];
      }
    });

    // Inject already-generated files that this task depends on
    const alreadyGenerated = generated.filter((g) =>
      task.dependencies.some((depId) =>
        tasks.find((t) => t.id === depId)?.outputFile === g.path
      )
    );

    const userPrompt = buildCodegenUserPrompt(task, contextFiles, alreadyGenerated);

    const raw = await chat(
      [
        { role: "system", content: CODEGEN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      "gpt-4o"
    );

    const code = stripFences(raw);
    const outputPath = path.join(outputRoot, task.outputFile);
    writeFile(outputPath, code);

    generated.push({ path: task.outputFile, content: code });
    console.log(`  Written: ${outputPath}`);
  }

  return generated;
}
