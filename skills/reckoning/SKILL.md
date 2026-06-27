---
name: reckoning
description: Use when the user wants to red-team / critique / stress-test a spec, PRD, design doc, or product idea before building. Runs an isolated praise vs. critic review, forces the user to commit their own assessment first, and returns a proceed/descope/kill verdict.
---

# Reckoning — spec red-team (Mode B: critique an existing spec)

You make AI attack a spec instead of flattering it. Follow these steps EXACTLY. Do not skip the cognitive-forcing pause.

## Step 0 — Get the spec
- If the user gave a file path, read it. **Reject paths outside the current working directory** (no `..` traversal, no absolute paths leaving the project).
- If they pasted text, use it directly.
- Derive a short slug (lowercase, hyphens) from the spec title for ids/filenames.

## Step 1 — COGNITIVE-FORCING PAUSE (do this BEFORE generating any critique)
Ask the user, with AskUserQuestion (or a direct prompt if unavailable):
> "Before I show you anything: in your own words — what do you think works about this spec, and what worries you most?"
Capture their answer verbatim. **Do not generate or reveal any AI analysis yet.**

## Step 2 — ISOLATED ADVERSARIAL FAN-OUT
Dispatch BOTH of these as separate subagents **in parallel, in the same message**, each with ONLY the spec text as context (never share one's output with the other):
- `praise-engine` → returns PraiseAnalysis JSON.
- `critic-assassin` → returns CriticalAnalysis JSON.
Neither subagent may see the other's output or the user's Step-1 answer.

## Step 3 — VALIDATE + RENDER (deterministic core)
- Write each subagent's JSON to a temp file (e.g. `/tmp/reckoning-<slug>-critical.json`, `/tmp/reckoning-<slug>-praise.json`).
- Validate each:
  `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts validate critical /tmp/reckoning-<slug>-critical.json`
  `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts validate praise /tmp/reckoning-<slug>-praise.json`
  If either prints `INVALID`, show the errors, ask that subagent to fix its JSON, and re-validate. Do not proceed on invalid output.
- Render the verdict:
  `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts render /tmp/reckoning-<slug>-critical.json /tmp/reckoning-<slug>-praise.json`

## Step 4 — PRESENT
- Show the rendered verdict markdown.
- Then append a **cognitive-forcing diff**: compare the user's Step-1 answer to the AI's findings. Call out: what the user flagged that the AI confirmed, what the AI found that the user missed, and where they disagree. This is the payoff — keep it short and direct.

Notes:
- `${CLAUDE_PLUGIN_ROOT}` is set by Claude Code to this plugin's install directory. Run `npm install` in it once if dependencies are missing.
- Mode A (raw idea → questions → draft PRD → critique) and the research toggle are out of scope for this version; if the user gives an idea rather than a spec, ask them to provide a written spec for now.
