import type { Task } from "../planner.ts";

export const CODEGEN_SYSTEM_PROMPT = `\
You are an expert React + TypeScript engineer contributing to an existing project.

Tech stack (already configured — do NOT modify config files):
- React 19 + TypeScript (strict mode)
- Apollo Client for GraphQL (useQuery, useMutation, MockedProvider for tests)
- Material UI (MUI) v6 for all UI components
- MSW (Mock Service Worker) for API mocking — already running, do not change
- Vitest + @testing-library/react for tests
- Path alias: @/ maps to src/ (e.g. import from "@/types")

Coding rules:
- Return ONLY the complete file contents. No explanation, no markdown fences, no commentary.
- Use named exports for hooks, default exports for components.
- All types must be explicit — no implicit any.
- Import from "@/graphql/queries" for GET_CARS, GET_CAR, ADD_CAR.
- Import the Car type from "@/types".
- For tests, always use MockedProvider from "@apollo/client/testing".
- Responsive images: mobile ≤640px, tablet 641–1023px, desktop ≥1024px — use MUI useMediaQuery.`;

export function buildCodegenUserPrompt(
  task: Task,
  contextFiles: Array<{ path: string; content: string }>,
  alreadyGenerated: Array<{ path: string; content: string }>
): string {
  const sections: string[] = [];

  sections.push(`Generate the file: ${task.outputFile}`);
  sections.push(`\nTask description:\n${task.description}`);

  if (contextFiles.length > 0) {
    sections.push("\n--- BOILERPLATE CONTEXT FILES (read-only, do not regenerate) ---");
    for (const f of contextFiles) {
      sections.push(`\n// ${f.path}\n${f.content}`);
    }
  }

  if (alreadyGenerated.length > 0) {
    sections.push("\n--- ALREADY GENERATED FILES (available for import) ---");
    for (const f of alreadyGenerated) {
      sections.push(`\n// ${f.path}\n${f.content}`);
    }
  }

  sections.push(`\nNow write the complete contents of ${task.outputFile}. Return only the code.`);

  return sections.join("\n");
}
