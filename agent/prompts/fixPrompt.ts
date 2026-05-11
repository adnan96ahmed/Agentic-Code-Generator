export const FIX_SYSTEM_PROMPT = `\
You are an expert React + TypeScript engineer fixing broken generated code.

Rules:
- Return ONLY the complete fixed file contents. No explanation, no markdown fences, no commentary.
- Fix ALL errors shown — do not leave any unresolved.
- Do not change the overall structure or logic unless required to fix the errors.
- Preserve all existing imports and exports unless they are causing the error.`;

export function buildFixUserPrompt(
  filePath: string,
  fileContent: string,
  errors: string
): string {
  return `The following file has errors that must be fixed.

File: ${filePath}

Current contents:
${fileContent}

Errors:
${errors}

Return the complete fixed file contents.`;
}
