import { chat } from "./tools/llm.ts";
import { PLANNER_SYSTEM_PROMPT, buildPlannerUserPrompt } from "./prompts/plannerPrompt.ts";

export interface Task {
  id: string;
  description: string;
  outputFile: string;
  dependencies: string[];
  contextFiles: string[];
}

export async function plan(spec: string): Promise<Task[]> {
  console.log("Planning tasks from spec...");

  const raw = await chat(
    [
      { role: "system", content: PLANNER_SYSTEM_PROMPT },
      { role: "user", content: buildPlannerUserPrompt(spec) },
    ],
    "gpt-4o"
  );

  let tasks: unknown;
  try {
    tasks = JSON.parse(raw);
  } catch {
    throw new Error(`Planner returned invalid JSON:\n${raw}`);
  }

  if (!Array.isArray(tasks)) {
    throw new Error(`Planner response is not an array:\n${raw}`);
  }

  const validated = tasks.map((t, i) => {
    assertTask(t, i);
    return t as Task;
  });

  console.log(`Planner produced ${validated.length} tasks:`);
  validated.forEach((t) => console.log(`  [${t.id}] ${t.outputFile}`));

  return validated;
}

function assertTask(t: unknown, index: number): void {
  if (typeof t !== "object" || t === null) {
    throw new Error(`Task at index ${index} is not an object`);
  }
  const obj = t as Record<string, unknown>;
  const required: Array<[string, string]> = [
    ["id", "string"],
    ["description", "string"],
    ["outputFile", "string"],
  ];
  for (const [key, type] of required) {
    if (typeof obj[key] !== type) {
      throw new Error(`Task[${index}].${key} must be a ${type}, got: ${JSON.stringify(obj[key])}`);
    }
  }
  if (!Array.isArray(obj["dependencies"])) {
    throw new Error(`Task[${index}].dependencies must be an array`);
  }
  if (!Array.isArray(obj["contextFiles"])) {
    throw new Error(`Task[${index}].contextFiles must be an array`);
  }
}
