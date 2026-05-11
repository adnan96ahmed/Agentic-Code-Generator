# Car Inventory Agent

A TypeScript CLI agent that reads a natural-language product specification and autonomously generates a working React + TypeScript application into a provided boilerplate.

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Add your OpenAI API key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY

# 3. Run the agent
npx tsx agent/index.ts --spec agent/sample-spec.txt --output ./generated-app

# 4. Run the generated app
cd generated-app && npm install && npm run dev
```

---

## Architecture

```
sample-spec.txt
      │
      ▼
┌─────────────┐
│   Planner   │  LLM call: spec → ordered JSON task list (gpt-4o)
└──────┬──────┘
       │  Task[]
       ▼
┌─────────────┐
│  Generator  │  LLM call per file: task + context → source code (gpt-4o)
└──────┬──────┘
       │  writes files to generated-app/
       ▼
┌─────────────┐
│  Validator  │  npm install → tsc --noEmit → vitest run
└──────┬──────┘
       │  passed? → done
       │  failed? ↓
       ▼
┌─────────────┐
│    Fixer    │  LLM call per broken file: error + file → patched file (gpt-4o)
└──────┬──────┘
       │  re-runs Validator (up to 3 retries)
       ▼
  generated-app/
```

### File Structure

```
agent/
├── index.ts              # Orchestrator — CLI entry point
├── planner.ts            # Spec → JSON task list
├── generator.ts          # Task list → generated source files
├── validator.ts          # Runs typecheck + tests, returns errors
├── fixer.ts              # Error-feedback retry loop
├── prompts/
│   ├── plannerPrompt.ts  # Planner system + user prompt
│   ├── codegenPrompt.ts  # Per-file generation prompt
│   └── fixPrompt.ts      # Error fix prompt
├── tools/
│   ├── fs.ts             # File system utilities
│   ├── shell.ts          # execSync wrapper (non-throwing)
│   └── llm.ts            # OpenAI API wrapper
└── sample-spec.txt       # Natural-language app specification
```

---

## LLM Usage

| Stage     | Model     | Why |
|-----------|-----------|-----|
| Planner   | gpt-4o    | Needs strong reasoning to decompose specs into ordered, dependency-aware tasks and return valid JSON |
| Generator | gpt-4o    | Needs to follow strict type constraints, coding rules, and produce correct TypeScript on the first pass |
| Fixer     | gpt-4o    | Error recovery requires understanding compiler output and patching code precisely without introducing new issues |
| Default   | gpt-4o-mini | Used only as the `llm.ts` fallback — not invoked by any agent stage in practice |

**Why not gpt-4o-mini for everything?** The planner, generator, and fixer all require careful instruction-following across large prompts with strict constraints (exact type names, import patterns, Vitest vs Jest distinctions). In testing, gpt-4o-mini produced more type errors and prompt-following failures, requiring more retry cycles and ultimately costing more in total. gpt-4o is more reliable on the first pass.

---

## Design Decisions

**Single orchestrator over multi-agent**
A linear planner → generator → validator → fixer loop is easier to debug, reason about, and modify than a multi-agent graph. The challenge explicitly values clean engineering judgment over architectural ambition.

**File-by-file generation**
Each task generates exactly one file. This keeps each LLM call focused and short, avoids hitting context limits, and makes it easy to identify which file caused a validation failure.

**Selective context injection**
Each generation prompt only receives the boilerplate files and already-generated dependencies that are relevant to that specific file — not the entire repo. This reduces token usage and prevents the LLM from being distracted by irrelevant context. Context rules are encoded in the planner's task list (`contextFiles` per task).

**Prompt-as-specification**
The codegen system prompt encodes the full tech stack contract: exact `Car` type fields, correct import paths, Vitest vs Jest distinctions, mock patterns, and output format rules. This front-loads constraint enforcement at generation time rather than relying on the fixer to clean up avoidable errors.

**Validator runs npm install**
The generated app has no `node_modules` after copying the boilerplate. The validator runs `npm install` before typecheck and tests, matching exactly what the submission requires (`cd generated-app && npm install && npm run dev`).

---

## Tradeoffs & What I'd Improve

**With more time:**
- **Parallel generation** — tasks with no dependencies could be generated concurrently, cutting total runtime significantly
- **Smarter context selection** — currently `contextFiles` is determined by the planner LLM; a static dependency graph would be more reliable and cheaper
- **Streaming output** — stream LLM responses to show progress instead of waiting for each full response
- **Richer retry logic** — the fixer currently re-sends the entire error blob; a smarter approach would parse the error, identify the specific line, and send a minimal surgical patch prompt
- **Caching** — cache planner output for the same spec to avoid re-planning on re-runs

**Known limitations:**
- The generated tests are intentionally simple (render + assert visible text) to avoid jsdom environment edge cases with `window.matchMedia` and `useMediaQuery`
- The fixer can exhaust its 3 retries on cascading type errors before resolving test failures if generation quality is low

---

## Approximate Cost Per Run

| Stage         | Calls | Approx tokens (in+out) | Cost (gpt-4o) |
|---------------|-------|------------------------|---------------|
| Planner       | 1     | ~2,000                 | ~$0.01        |
| Generator     | 7     | ~3,000 each = ~21,000  | ~$0.11        |
| Fixer (1 pass)| 2–3   | ~3,000 each = ~9,000   | ~$0.05        |
| **Total**     |       | **~32,000**            | **~$0.17**    |

Runs without any fix cycles: ~$0.12. Runs requiring 2–3 fix passes: ~$0.20–0.25.
