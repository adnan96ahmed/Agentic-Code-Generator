import fs from "node:fs";
import path from "node:path";

const COPY_EXCLUDE = new Set([
  "node_modules",
  ".git",
  "generated-app",
  "agent",
  "README.md",       // challenge brief — not relevant to the output app
  "tickets.md",      // planning docs
  "plan.md",         // planning docs
  ".env.example",    // generated app uses MSW, no API keys needed
  ".env",            // never copy secrets
]);

export function copyBoilerplate(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (COPY_EXCLUDE.has(entry)) continue;
    fs.cpSync(path.join(src, entry), path.join(dest, entry), { recursive: true });
  }
}

export function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}
