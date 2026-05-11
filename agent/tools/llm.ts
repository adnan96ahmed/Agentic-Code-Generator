import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import OpenAI from "openai";

// Load .env from the project root regardless of which directory the process is run from
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env") });
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const apiKey = process.env["OPENAI_API_KEY"];
if (!apiKey) {
  console.error("Error: OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

export async function chat(
  messages: ChatCompletionMessageParam[],
  model = "gpt-4o-mini"
): Promise<string> {
  const response = await openai.chat.completions.create({ model, messages });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned an empty response.");
  return content;
}
