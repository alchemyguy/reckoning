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

`<skill-dir>` below means the absolute path of the folder that contains this SKILL.md. Substitute it in every command.

Files in this skill (paths are relative to this SKILL.md):
- `references/synthesizer.md`: prompt for the PRD writer (Mode A). Returns PRDDocument JSON.
- `references/praise-engine.md`: prompt for the strengths analyst. Returns PraiseAnalysis JSON.
- `references/critic-assassin.md`: prompt for the critic. Returns CriticalAnalysis JSON.
- `scripts/reckoning.mjs`: short, readable, dependency-free validator and renderer (Node 18+).
- `examples/expected-prd.md` and `examples/expected-verdict.md`: what finished output looks like (format only: that example's spec quoted research findings, so its reviews cite them; yours must stick to what your spec says).

Write every intermediate file to `.reckoning/` in the working directory, and create that folder first if it doesn't exist (`mkdir -p .reckoning`). Use a short slug (lowercase, hyphens) derived from the idea or spec title.

## Step 0: Choose the mode
Ask the user: **"Is this a raw idea, or an existing spec/PRD?"**
- Raw idea → **Mode A**.
- Existing spec/PRD → **Mode B**.

## Mode A: Idea → interview → draft PRD
1. **Interview** the user, up to 3 rounds of 4–8 questions each. Cover: target users, the core problem and how painful it is, the competitive landscape, the business model, scope and timeline, technical constraints, success criteria, and what makes the idea different. Sharpen the questions each round, and stop when you have enough. Use a structured question tool if you have one; otherwise ask in plain chat.
2. **Draft** a PRDDocument JSON by following `references/synthesizer.md`, using only the idea and the Q&A transcript. Run this in a subagent or isolated task if you can, giving it the prompt, the idea, the transcript, `projectId` = the slug and `createdAt` = the current UTC time (`date -u +%Y-%m-%dT%H:%M:%SZ`); ask it to reply with only the JSON. Write it to `.reckoning/<slug>-prd.json`.
3. **Validate** the draft, but don't show it yet. Its flagged risks are AI analysis and would anchor the user's answer in the pause:
   ```
   node <skill-dir>/scripts/reckoning.mjs validate prd .reckoning/<slug>-prd.json
   ```
   The drafted PRD JSON is the "spec" for the critique core: give reviewers the JSON, and they cite its section ids. You'll show the rendered draft in step 4.

## Mode B: Existing spec
Read the file path the user gave (reject paths outside the current project: no `..` traversal, no absolute paths that leave it), or use the pasted text. That is the "spec" for the critique core.

## Critique core (both modes)
1. **Cognitive-forcing pause.** Before any critique, ask:
   > "Before I show you anything: in your own words, what do you think works about this spec, and what worries you most?"

   In Mode A, ask it about their idea instead of "this spec".

   Record the answer word for word. Do not reveal any AI analysis yet.
2. **Isolated review.** Neither analysis may see the other's output or the user's answer.
   - **If you can start subagents or isolated tasks**, start two in parallel: one with `references/praise-engine.md`, one with `references/critic-assassin.md`.
   - **If you cannot**, run them one after the other as separate passes, critic first. Before each pass, re-read only the spec and that pass's reference prompt, and do not use the user's Step-1 answer or the other pass's findings. Start your Step 4 output with this line:
     > Note: no isolated subagents were available, so these reviews ran one after the other in the same session and the second pass could see the first.

   **What to give a review agent:** its reference prompt, the spec text, and three values: `projectId` = the slug, `createdAt` = the current UTC time (`date -u +%Y-%m-%dT%H:%M:%SZ`), `modelUsed` = your model name. Nothing else: not the user's answer, not the other review. Ask it to reply with only the JSON, and save that reply unchanged.
3. **Validate and render.** Write `.reckoning/<slug>-critical.json` and `.reckoning/<slug>-praise.json`, then run:
   ```
   node <skill-dir>/scripts/reckoning.mjs validate critical .reckoning/<slug>-critical.json
   node <skill-dir>/scripts/reckoning.mjs validate praise .reckoning/<slug>-praise.json
   node <skill-dir>/scripts/reckoning.mjs render .reckoning/<slug>-critical.json .reckoning/<slug>-praise.json
   ```
   On `INVALID`, fix the JSON using the listed errors and validate again. Never continue on invalid output.
4. **Present.** In Mode A, first show the rendered draft (`node <skill-dir>/scripts/reckoning.mjs render-prd .reckoning/<slug>-prd.json`). Then show the rendered verdict as printed (don't rewrite it). Then add a short **cognitive-forcing diff**: what the user flagged that the AI confirmed, what the AI found that they missed, and where they disagree.

**No Node available?** Check each JSON yourself against the schema in its reference prompt and write the markdown by hand following the section structure of the files in `examples/` (skim them; the verdict example is long). Verdict rule: KILL if `killRecommendation.kill` is true; otherwise DESCOPE if there is any critical-severity item or two or more `weak` market verdicts; otherwise PROCEED.
