---
name: spec-red-team
description: Red-team an existing spec, PRD, or design doc before you build it. Runs an isolated strongest-case vs. harshest-case review (praise and critic never see each other), makes you commit your own assessment first, then returns a severity-ranked proceed / descope / kill verdict. Use when asked to critique, stress-test, poke holes in, pre-mortem, or review a spec, PRD, RFC, or product plan.
license: MIT
metadata:
  version: "0.2.0"
  author: Mukesh Chandra
  homepage: https://github.com/alchemyguy/reckoning
---

# Spec Red-Team

You make AI attack a spec instead of flattering it. Follow these steps exactly. Never skip the cognitive-forcing pause.

`<skill-dir>` below means the absolute path of the folder that contains this SKILL.md. Substitute it in every command.

Files in this skill (paths are relative to this SKILL.md):
- `references/praise-engine.md`: prompt for the strengths analyst. Returns PraiseAnalysis JSON.
- `references/critic-assassin.md`: prompt for the critic. Returns CriticalAnalysis JSON.
- `scripts/reckoning.mjs`: short, readable, dependency-free validator and renderer (Node 18+).
- `examples/expected-verdict.md`: what a finished verdict looks like.

## Step 0: Get the spec
- If the user gave a file path, read it. Reject paths outside the current project (no `..` traversal, no absolute paths that leave it).
- If they pasted text, use it directly.
- Derive a short slug (lowercase, hyphens) from the spec title. Use it for ids and filenames.

## Step 1: Cognitive-forcing pause (BEFORE any critique)
Ask the user:
> "Before I show you anything: in your own words, what do you think works about this spec, and what worries you most?"

Record their answer word for word. Do not generate or reveal any AI analysis yet.

## Step 2: Isolated adversarial review
Run the two analyses so neither can see the other's output or the user's Step-1 answer:
- **If you can start subagents or isolated tasks**, start two in parallel. Give each one only the spec text plus its reference prompt: `references/praise-engine.md` and `references/critic-assassin.md`.
- **If you cannot**, run them one after the other as separate passes. Before each pass, set aside everything except the spec and that pass's reference prompt. Do not let the first pass's findings shape the second. Run the critic first. In Step 4, tell the user the review ran without true isolation.

## Step 3: Validate and render
1. Create `.reckoning/` in the working directory if it doesn't exist (`mkdir -p .reckoning`). Write each JSON result there: `.reckoning/<slug>-critical.json` and `.reckoning/<slug>-praise.json`.
2. Validate both:
   ```
   node <skill-dir>/scripts/reckoning.mjs validate critical .reckoning/<slug>-critical.json
   node <skill-dir>/scripts/reckoning.mjs validate praise .reckoning/<slug>-praise.json
   ```
   If either prints `INVALID`, fix that JSON using the listed errors and validate again. Never continue on invalid output.
3. Render the verdict:
   ```
   node <skill-dir>/scripts/reckoning.mjs render .reckoning/<slug>-critical.json .reckoning/<slug>-praise.json
   ```

**No Node available?** Check each JSON yourself against the schema in its reference prompt. Then write the verdict by hand in the format of `examples/expected-verdict.md`, with this verdict rule: KILL if `killRecommendation.kill` is true; otherwise DESCOPE if there is any critical-severity item or two or more `weak` market verdicts; otherwise PROCEED.

## Step 4: Present
- Show the rendered verdict.
- Then add a short **cognitive-forcing diff** that compares the user's Step-1 answer with the findings: what they flagged that the AI confirmed, what the AI found that they missed, and where they disagree.
