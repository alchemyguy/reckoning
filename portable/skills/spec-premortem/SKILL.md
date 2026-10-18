---
name: spec-premortem
description: Run a harsh pre-mortem on a spec, PRD, or product idea. Assumes the project failed and works out why, with severity- and likelihood-ranked failure modes, scale pain, user confusion risks, engineering regrets, and a market-skeptic check (why care, why now, why win, feature or product), then gives a proceed / descope / kill call. Use when asked for a pre-mortem, devil's advocate, failure analysis, risk review, or "what could go wrong" on a plan or spec.
license: MIT
metadata:
  version: "0.2.0"
  author: Mukesh Chandra
  homepage: https://github.com/alchemyguy/reckoning
---

# Spec Pre-mortem

You find every way a spec could fail, without flattering it or hedging.

`<skill-dir>` below means the absolute path of the folder that contains this SKILL.md. Substitute it in every command.

Files in this skill:
- `references/critic-assassin.md`: the critic prompt and the CriticalAnalysis JSON schema.
- `scripts/reckoning.mjs`: a short, readable, dependency-free validator and renderer (Node 18+).

## Step 0: Get the spec
- If the user gave a file path, read it. Reject paths outside the current project (no `..` traversal, no absolute paths that leave it).
- If they pasted text, use it directly.
- Derive a short slug (lowercase, hyphens) from the spec title.

## Step 1: Your take first
Ask the user:
> "Before I show you anything: what worries you most about this spec?"

Record their answer word for word. Do not reveal any analysis yet.

## Step 2: Critique
Follow `references/critic-assassin.md` and give it only the spec text. If you can start a subagent or isolated task, run it there so the user's answer cannot bias it. The output is a CriticalAnalysis JSON object.

## Step 3: Validate and render
Create `.reckoning/` in the working directory if it doesn't exist (`mkdir -p .reckoning`). Write the JSON to `.reckoning/<slug>-critical.json`, then run:
```
node <skill-dir>/scripts/reckoning.mjs validate critical .reckoning/<slug>-critical.json
node <skill-dir>/scripts/reckoning.mjs render-critical .reckoning/<slug>-critical.json
```
If validation prints `INVALID`, fix the JSON using the listed errors and validate again. Never continue on invalid output.

**No Node available?** Check the JSON yourself against the schema in the reference prompt and write the markdown by hand. Use these sections: verdict, failure modes sorted by severity, market skeptic, overall. Verdict rule: KILL if `killRecommendation.kill` is true; otherwise DESCOPE if there is any critical-severity item or two or more `weak` market verdicts; otherwise PROCEED.

## Step 4: Present
Show the pre-mortem. Then add a short diff against the user's Step-1 worry: what the critique confirmed, what it found that they missed, and what it didn't back up. For the full balanced review with strengths, suggest the `spec-red-team` or `reckon` skill.
