---
name: reckoning
description: Use when the user wants to red-team / critique / stress-test a spec, PRD, design doc, or product idea before building. Supports a raw idea (drafts a PRD via a clarifying interview) or an existing spec. Runs an isolated praise vs. critic review, forces the user to commit their own assessment first, and returns a proceed/descope/kill verdict.
---

# Reckoning — spec red-team

You make AI attack a spec instead of flattering it. Follow these steps EXACTLY. Do not skip the cognitive-forcing pause.

## Step 0 — Choose the mode
Ask the user (AskUserQuestion): **"Is this a raw idea, or an existing spec/PRD?"**
- **Existing spec/PRD** → go to **Mode B**.
- **Raw idea** → go to **Mode A**.

---

## Mode A — Idea → interview → draft PRD → critique

### A1. Clarifying interview (adaptive, up to 3 rounds)
Interview the user with AskUserQuestion to understand the idea before drafting. Ask **4–8 questions per round**, covering: target users, the core problem & how painful it is, competitive landscape, business model, scope/timeline, technical constraints, success criteria, and what makes it different. Start broad; use each round's answers to ask sharper follow-ups. Stop once you genuinely have enough to draft (or after **3 rounds**). Keep the full Q&A transcript.

### A2. Synthesize a draft PRD
Dispatch the `synthesizer` subagent with the idea + the full Q&A transcript. It returns a `PRDDocument` JSON drafted from the idea and answers ONLY — no research, empty citations, assumptions flagged. Write it to a temp file, e.g. `/tmp/reckoning-<slug>-prd.json`, and validate it:
`npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts validate prd /tmp/reckoning-<slug>-prd.json`
If it prints `INVALID`, show the errors, ask the synthesizer to fix its JSON, and re-validate. Do not proceed on invalid output.

### A3. Show the draft
Render and show the draft so the user sees exactly what will be critiqued:
`npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts render-prd /tmp/reckoning-<slug>-prd.json`
The "spec" for the critique core (below) is this drafted PRD.

→ Continue to the **Critique core**.

---

## Mode B — Critique an existing spec

### B0. Get the spec
- If the user gave a file path, read it. **Reject paths outside the current working directory** (no `..` traversal, no absolute paths leaving the project).
- If they pasted text, use it directly.
- Derive a short slug (lowercase, hyphens) from the spec title for ids/filenames.

The "spec" for the critique core is this loaded spec.

→ Continue to the **Critique core**.

---

## Critique core (shared by both modes)

### Step 1 — COGNITIVE-FORCING PAUSE (do this BEFORE generating any critique)
Ask the user, with AskUserQuestion:
> "Before I show you anything: in your own words — what do you think works about this spec, and what worries you most?"
Capture their answer verbatim. **Do not generate or reveal any AI analysis yet.**

### Step 2 — ISOLATED ADVERSARIAL FAN-OUT
Dispatch BOTH of these as separate subagents **in parallel, in the same message**, each with ONLY the spec text (the loaded spec in Mode B, or the drafted PRD in Mode A) as context:
- `praise-engine` → returns PraiseAnalysis JSON.
- `critic-assassin` → returns CriticalAnalysis JSON.
Neither subagent may see the other's output or the user's Step-1 answer.

### Step 3 — VALIDATE + RENDER
- Write each subagent's JSON to a temp file (e.g. `/tmp/reckoning-<slug>-critical.json`, `/tmp/reckoning-<slug>-praise.json`).
- Validate each:
  `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts validate critical /tmp/reckoning-<slug>-critical.json`
  `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts validate praise /tmp/reckoning-<slug>-praise.json`
  If either prints `INVALID`, show the errors, ask that subagent to fix its JSON, and re-validate. Do not proceed on invalid output.
- Render the verdict:
  `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts render /tmp/reckoning-<slug>-critical.json /tmp/reckoning-<slug>-praise.json`

### Step 4 — PRESENT
- Show the rendered verdict markdown.
- Then append a **cognitive-forcing diff**: compare the user's Step-1 answer to the AI's findings — what they flagged that the AI confirmed, what the AI found that they missed, and where they disagree. Keep it short and direct.

Notes:
- `${CLAUDE_PLUGIN_ROOT}` is set by Claude Code to this plugin's install directory. Run `npm install` in it once if dependencies are missing.
- Deep web research is not yet available; Mode A drafts from the interview only.
