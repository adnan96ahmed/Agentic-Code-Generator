import { run } from "./tools/shell.ts";

export interface ValidationResult {
  passed: boolean;
  errors: string;
}

export async function validate(outputRoot: string): Promise<ValidationResult> {
  console.log("\nValidating generated app...");

  const tscResult = run("npm run typecheck", outputRoot);
  if (tscResult.exitCode !== 0) {
    console.log("  TypeScript check failed.");
    return {
      passed: false,
      errors: `[typecheck]\n${tscResult.stdout}\n${tscResult.stderr}`.trim(),
    };
  }
  console.log("  TypeScript check passed.");

  const testResult = run("npm run test", outputRoot);
  if (testResult.exitCode !== 0) {
    console.log("  Tests failed.");
    return {
      passed: false,
      errors: `[test]\n${testResult.stdout}\n${testResult.stderr}`.trim(),
    };
  }
  console.log("  Tests passed.");

  return { passed: true, errors: "" };
}
