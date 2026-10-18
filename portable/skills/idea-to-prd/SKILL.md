---
name: idea-to-prd
description: Turn a raw product idea into a structured draft PRD through a short clarifying interview. Every assumption is flagged, sections carry honest confidence scores, and nothing is invented (no fake market data, competitors, or sources). Use when someone has an idea, a one-liner, or rough notes and wants a PRD, product spec, or requirements doc drafted.
license: MIT
metadata:
  version: "0.2.0"
  author: Mukesh Chandra
  homepage: https://github.com/alchemyguy/reckoning
---

# Idea → Draft PRD

You turn a raw idea into an honest draft PRD. Follow these steps exactly.

`<skill-dir>` below means the absolute path of the folder that contains this SKILL.md. Substitute it in every command.

Files in this skill (paths are relative to this SKILL.md):
- `references/synthesizer.md`: prompt for the PRD writer. Returns PRDDocument JSON.
- `scripts/reckoning.mjs`: short, readable, dependency-free validator and renderer (Node 18+).
- `examples/expected-prd.md`: what a finished draft looks like.

## Step 1: Clarifying interview (up to 3 rounds)
Interview the user before drafting. Ask **4–8 questions per round** about: target users, the core problem and how painful it is, the competitive landscape, the business model, scope and timeline, technical constraints, success criteria, and what makes the idea different. Start broad, then use each round's answers to ask sharper follow-ups. Stop when you have enough to draft, or after 3 rounds. Keep the full Q&A transcript.

Use a structured question tool if you have one. Otherwise ask in plain chat and wait for the answers.

## Step 2: Draft the PRD
Follow `references/synthesizer.md` and give it only the idea and the full Q&A transcript. If you can start a subagent or isolated task, run the drafting there. Otherwise follow the prompt directly. The output is a PRDDocument JSON built only from the user's answers: empty citations, assumptions flagged.

Derive a short slug (lowercase, hyphens) from the idea, create `.reckoning/` in the working directory if it doesn't exist (`mkdir -p .reckoning`), and write the JSON to `.reckoning/<slug>-prd.json`.

## Step 3: Validate and render
```
node <skill-dir>/scripts/reckoning.mjs validate prd .reckoning/<slug>-prd.json
node <skill-dir>/scripts/reckoning.mjs render-prd .reckoning/<slug>-prd.json
```
If validation prints `INVALID`, fix the JSON using the listed errors and validate again. Never continue on invalid output.

**No Node available?** Check the JSON yourself against the schema in `references/synthesizer.md`, then write the markdown by hand in the format of `examples/expected-prd.md`.

## Step 4: Present
Show the rendered draft. List the lowest-confidence sections and the flagged assumptions as the things to validate first. Offer to red-team the draft next (the `spec-red-team` or `reckon` skill).
