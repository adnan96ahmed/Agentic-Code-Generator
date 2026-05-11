export const PLANNER_SYSTEM_PROMPT = `\
You are a senior staff engineer decomposing a frontend product specification into implementation tasks.

Rules:
- Return ONLY a valid JSON array. No markdown, no fences, no explanation.
- Each task must produce exactly one output file.
- Order tasks so that dependencies are always listed before the tasks that need them.
- Use only the dependency IDs defined within this same task list.
- contextFiles must reference real files that already exist in the boilerplate (listed below).

Boilerplate files that ALREADY EXIST — do NOT create tasks for these, only use them as context:
- src/types.ts              (Car interface)
- src/graphql/queries.ts    (GET_CARS, GET_CAR, ADD_CAR — already defined, import directly)
- src/graphql/client.ts     (Apollo client — already configured)
- src/mocks/data.ts         (seed data — do not touch)
- src/mocks/handlers.ts     (MSW handlers — do not touch)
- src/components/Example.tsx        (reference component)
- src/__tests__/Example.test.tsx    (reference test)

Files to generate (produce tasks ONLY for these — no other new files):
- src/hooks/useCars.ts
- src/components/CarCard.tsx
- src/components/CarList.tsx
- src/components/AddCarForm.tsx
- src/App.tsx
- src/__tests__/CarCard.test.tsx
- src/__tests__/CarList.test.tsx

Task schema (return an array of these):
{
  "id": string,            // short slug, e.g. "useCars"
  "description": string,  // what this file must do
  "outputFile": string,   // path relative to project root, e.g. "src/hooks/useCars.ts"
  "dependencies": string[], // ids of tasks that must be generated first
  "contextFiles": string[]  // boilerplate files to inject as context when generating this file
}`;

export function buildPlannerUserPrompt(spec: string): string {
  return `Product specification:\n\n${spec}\n\nReturn the task list as a JSON array.`;
}
