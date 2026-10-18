---
name: reckon
description: Make AI attack your product idea or spec instead of flattering it. Takes a raw idea (interviews you and drafts a PRD with every assumption flagged) or an existing spec/PRD, then runs an isolated praise vs. critic review, makes you commit your own assessment first, and ends with a severity-ranked proceed / descope / kill verdict. Use when asked to validate, critique, stress-test, red-team, or pre-mortem an idea, PRD, spec, or product plan before building.
license: MIT
metadata:
  version: "0.2.0"
  author: Mukesh Chandra
  homepage: https://github.com/alchemyguy/reckoning
---

# Reckon: idea or spec → verdict

You make AI attack a spec instead of flattering it. Follow these steps exactly. Never skip the cognitive-forcing pause.

Files in this skill (paths are relative to this SKILL.md):
- `references/synthesizer.md`: prompt for the PRD writer (Mode A). Returns PRDDocument JSON.
- `references/praise-engine.md`: prompt for the strengths analyst. Returns PraiseAnalysis JSON.
- `references/critic-assassin.md`: prompt for the critic. Returns CriticalAnalysis JSON.
- `scripts/reckoning.mjs`: dependency-free validator and renderer (Node 18+).
- `examples/expected-prd.md` and `examples/expected-verdict.md`: what finished output looks like.

Write every intermediate file to `.reckoning/` in the working directory. Use a short slug (lowercase, hyphens) derived from the idea or spec title.

## Step 0: Choose the mode
Ask the user: **"Is this a raw idea, or an existing spec/PRD?"**
- Raw idea → **Mode A**.
- Existing spec/PRD → **Mode B**.

## Mode A: Idea → interview → draft PRD
1. **Interview** the user, up to 3 rounds of 4–8 questions each. Cover: target users, the core problem and how painful it is, the competitive landscape, the business model, scope and timeline, technical constraints, success criteria, and what makes the idea different. Sharpen the questions each round, and stop when you have enough. Use a structured question tool if you have one; otherwise ask in plain chat.
2. **Draft** a PRDDocument JSON by following `references/synthesizer.md`, using only the idea and the Q&A transcript. Run this in a subagent or isolated task if you can. Write it to `.reckoning/<slug>-prd.json`.
3. **Validate and show** the draft:
   ```
   node <skill-dir>/scripts/reckoning.mjs validate prd .reckoning/<slug>-prd.json
   node <skill-dir>/scripts/reckoning.mjs render-prd .reckoning/<slug>-prd.json
   ```
   The drafted PRD is the "spec" for the critique core.

## Mode B: Existing spec
Read the file path the user gave (reject paths outside the current project: no `..` traversal, no absolute paths that leave it), or use the pasted text. That is the "spec" for the critique core.

## Critique core (both modes)
1. **Cognitive-forcing pause.** Before any critique, ask:
   > "Before I show you anything: in your own words, what do you think works about this spec, and what worries you most?"

   Record the answer word for word. Do not reveal any AI analysis yet.
2. **Isolated review.** Neither analysis may see the other's output or the user's answer.
   - **If you can start subagents or isolated tasks**, start two in parallel. Give each only the spec plus `references/praise-engine.md` or `references/critic-assassin.md`.
   - **If you cannot**, run them one after the other as separate passes, critic first. Before each pass, set aside everything except the spec and that pass's prompt. In the final output, tell the user the review ran without true isolation.
3. **Validate and render.** Write `.reckoning/<slug>-critical.json` and `.reckoning/<slug>-praise.json`, then run:
   ```
   node <skill-dir>/scripts/reckoning.mjs validate critical .reckoning/<slug>-critical.json
   node <skill-dir>/scripts/reckoning.mjs validate praise .reckoning/<slug>-praise.json
   node <skill-dir>/scripts/reckoning.mjs render .reckoning/<slug>-critical.json .reckoning/<slug>-praise.json
   ```
   On `INVALID`, fix the JSON using the listed errors and validate again. Never continue on invalid output.
4. **Present.** Show the verdict. Then add a short **cognitive-forcing diff**: what the user flagged that the AI confirmed, what the AI found that they missed, and where they disagree.

**No Node available?** Check each JSON yourself against the schema in its reference prompt and write the markdown by hand in the format of the files in `examples/`. Verdict rule: KILL if `killRecommendation.kill` is true; otherwise DESCOPE if there is any critical-severity item or two or more `weak` market verdicts; otherwise PROCEED.
