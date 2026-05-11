# Delivery Tickets

## Ticket 1 — Tools Layer
**Goal:** Build the low-level utilities the agent depends on.
**Files:**
- `agent/tools/fs.ts` — copyBoilerplate, writeFile, readFile, ensureDir
- `agent/tools/shell.ts` — run() wrapping execSync, returns ShellResult
- `agent/tools/llm.ts` — chat() wrapping OpenAI SDK, loads API key from env

**Done when:** All three files exist with no TypeScript errors.

---

## Ticket 2 — Planner
**Goal:** LLM call that turns a natural-language spec into an ordered, dependency-aware JSON task list.
**Files:**
- `agent/prompts/plannerPrompt.ts` — system + user prompt templates
- `agent/planner.ts` — sends spec to LLM, parses and returns Task[]

**Done when:** Running planner against `sample-spec.txt` produces a valid JSON task list with correct dependency ordering.

---

## Ticket 3 — Code Generator
**Goal:** Iterate over the task list and generate each file using a focused LLM prompt with selective context injection.
**Files:**
- `agent/prompts/codegenPrompt.ts` — per-task prompt template
- `agent/generator.ts` — reads context files, calls LLM, writes output files

**Done when:** All target files are written into `generated-app/src/` and the project compiles.

---

## Ticket 4 — Validator
**Goal:** Run the generated app's test suite and typecheck, capture output for the retry loop.
**Files:**
- `agent/validator.ts` — runs `npm run typecheck` and `npm run test`, returns { passed, errors }

**Done when:** Validator correctly returns pass/fail + error text after generation.

---

## Ticket 5 — Fixer (Retry Loop)
**Goal:** Feed validation errors back into the LLM to patch broken files, then re-validate.
**Files:**
- `agent/prompts/fixPrompt.ts` — error + file content → fix prompt
- `agent/fixer.ts` — reads broken file, calls LLM, writes fix, re-runs validator (max 2 retries)

**Done when:** Agent self-corrects at least one TypeScript or test error without manual intervention.

---

## Ticket 6 — Orchestrator
**Goal:** Wire all stages into a single runnable CLI entry point.
**Files:**
- `agent/index.ts` — reads spec from argv, copies boilerplate, runs planner → generator → validator → fixer loop

**Done when:** `npm run agent -- --spec agent/sample-spec.txt` produces a runnable `generated-app/` directory.

---

## Ticket 7 — Sample Spec + Generated Output
**Goal:** Provide a clean natural-language spec file and a committed sample output.
**Files:**
- `agent/sample-spec.txt` — natural-language description of the Car Inventory Manager
- `generated-app/` — sample output that passes `npm run dev`, `npm run test`, `npm run typecheck`

**Done when:** A reviewer can clone the repo, run the agent, and get a working app.

---

## Ticket 8 — README + Write-up
**Goal:** Document architecture decisions, how to run, tradeoffs, and cost estimate.
**Files:**
- `agent/README.md` — architecture diagram, LLM choice, design decisions, approximate cost per run

**Done when:** README covers all required submission sections from the challenge spec.
