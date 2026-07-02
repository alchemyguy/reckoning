# Reckoning — Milestone 2 Implementation Plan (Mode A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add **Mode A** to `/reckon` — given a raw idea, run an adaptive multi-round clarifying interview, synthesize a draft PRD (no research), show it, then feed it into the existing M1 critique core (isolated Praise/Critic → verdict).

**Architecture:** Reuses the entire M1 tested core (schemas, validate, verdict, render, cli) and the isolated Praise/Critic fan-out + cognitive-forcing pause. M2 adds three things: (1) `PRDDocument.researchReportId` becomes optional (Mode A has no research report); (2) a deterministic `renderPRD` + `render-prd` CLI subcommand to show the draft; (3) a `synthesizer` subagent that drafts a PRD from idea + Q&A. The orchestrator skill gains a Step 0 mode-ask and a Mode A branch; the multi-round interview is driven by the skill itself via the host's AskUserQuestion (it is not isolation-sensitive, so it needs no subagent and no questions schema).

**Tech Stack:** Unchanged from M1 — Node 24, TypeScript strict, Zod, Vitest, tsx. Claude Code plugin.

**Repo:** This work happens in the standalone `reckoning` repo at `/Users/alchemyguy/development/startup/reckoning` (NOT prd-system). Plugin files are at the repo root (`src/`, `agents/`, `skills/`, `test/`, …).

**M2 design decisions (locked):** adaptive multi-round interview (≤3 rounds); `/reckon` asks upfront whether the input is a raw idea or an existing spec; after synthesis, show the draft PRD before critiquing.

## Global Constraints

- **Node** `>=24.0.0`. **TypeScript strict.** **NEVER use `any`.**
- **All agent JSON validated with Zod before render/use** (via the M1 `validateAgainst` boundary / CLI).
- **Praise and Critic stay isolated** — separate subagents, parallel, zero shared state, never seeing each other or the user's own assessment. (Unchanged from M1; the new synthesizer step runs BEFORE the critique core and is not part of the isolation set.)
- **No secrets / API keys.** Inference is the host Claude Code session.
- **ESM**, `moduleResolution: bundler` (extensionless imports). CLI runs via `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts …`.
- **Synthesizer must NOT invent research or facts.** Mode A has no research — the draft is based ONLY on the idea + the user's answers; assumptions are flagged, `citations` arrays are empty.
- **Commits:** Conventional Commit messages. **NEVER a `Co-Authored-By` trailer.**
- Each task: bite-sized TDD where there is logic; structural verification for markdown agent/skill files.

## File Structure (M2 changes)

```
reckoning/
├── src/
│   ├── schemas/prd.ts          # MODIFY: researchReportId -> optional
│   ├── render-prd.ts           # CREATE: renderPRD(prd) deterministic markdown
│   └── cli.ts                  # MODIFY: add `render-prd <prdPath>` subcommand
├── agents/
│   └── synthesizer.md          # CREATE: drafts a PRD from idea + Q&A (no research)
├── skills/reckoning/SKILL.md   # MODIFY: Step 0 mode-ask + Mode A branch + shared critique core
├── commands/reckon.md          # MODIFY: mention both modes
├── test/
│   ├── schemas.test.ts         # MODIFY: add no-researchReportId PRD case
│   ├── render-prd.test.ts      # CREATE
│   └── cli.test.ts             # MODIFY: add render-prd case
├── examples/forge-pulse/
│   └── expected-prd.md         # CREATE: generated draft-PRD render of prd-v1.json
└── README.md                   # MODIFY: note Mode A
```

---

## Task 1: PRD schema — make `researchReportId` optional

**Files:**
- Modify: `src/schemas/prd.ts`
- Modify: `test/schemas.test.ts`

**Interfaces:**
- Produces: `PRDDocumentSchema` with `researchReportId` optional. Consumed by `validate.ts`, `render-prd.ts`, the synthesizer flow.

- [ ] **Step 1: Add the failing test to `test/schemas.test.ts`**

Append inside the file (after the existing PRD describe block):

```typescript
describe('PRDDocumentSchema — no research report (Mode A)', () => {
  it('accepts a PRD with no researchReportId', () => {
    const prd = {
      id: 'prd-001',
      projectId: 'my-idea',
      version: 'v1',
      createdAt: '2026-06-27T00:00:00Z',
      sections: [],
      assumptionsExplicit: [],
      contradictionsFlagged: [],
    };
    const result = PRDDocumentSchema.safeParse(prd);
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx vitest run test/schemas.test.ts`
Expected: FAIL — the new case errors because `researchReportId` is required (`researchReportId: Required`).

- [ ] **Step 3: Make the field optional in `src/schemas/prd.ts`**

Change the line:
```typescript
  researchReportId: z.string(),
```
to:
```typescript
  researchReportId: z.string().optional(),
```
(Leave every other field unchanged.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx vitest run test/schemas.test.ts`
Expected: PASS — both the forge-pulse fixture (which HAS researchReportId) and the new no-research case validate.

- [ ] **Step 5: Commit**

```bash
cd /Users/alchemyguy/development/startup/reckoning
git add src/schemas/prd.ts test/schemas.test.ts
git commit -m "feat: make PRDDocument.researchReportId optional for research-free Mode A"
```

---

## Task 2: `renderPRD` — deterministic draft-PRD markdown

**Files:**
- Create: `src/render-prd.ts`
- Create: `test/render-prd.test.ts`

**Interfaces:**
- Consumes: `PRDDocument` type from `schemas/prd`.
- Produces: `renderPRD(prd: PRDDocument): string`. Consumed by `cli.ts` (`render-prd`).

- [ ] **Step 1: Write the failing test `test/render-prd.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderPRD } from '../src/render-prd';
import type { PRDDocument } from '../src/schemas/prd';

function fixture<T>(name: string): T {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  ) as T;
}

describe('renderPRD', () => {
  const prd = fixture<PRDDocument>('prd-v1.json');
  const md = renderPRD(prd);

  it('renders a draft-PRD header', () => {
    expect(md).toMatch(/# Draft PRD —/);
  });

  it('renders each section title in order with a confidence percentage', () => {
    expect(prd.sections.length).toBeGreaterThan(0);
    const first = prd.sections[0]!;
    expect(md).toContain(`## ${first.title}`);
    expect(md).toMatch(/confidence \d+%/);
    // section order preserved: first section title appears before the second
    if (prd.sections.length > 1) {
      const second = prd.sections[1]!;
      expect(md.indexOf(`## ${first.title}`)).toBeLessThan(md.indexOf(`## ${second.title}`));
    }
  });

  it('renders flags when a section has them', () => {
    const flagged = prd.sections.find((s) => s.flags.length > 0);
    if (flagged) expect(md).toContain(flagged.flags[0]!);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx vitest run test/render-prd.test.ts`
Expected: FAIL — cannot resolve `../src/render-prd`.

- [ ] **Step 3: Write `src/render-prd.ts`**

```typescript
import type { PRDDocument } from './schemas/prd';

export function renderPRD(prd: PRDDocument): string {
  const lines: string[] = [];
  lines.push(`# Draft PRD — ${prd.projectId} (${prd.version})`);
  lines.push('');

  for (const section of prd.sections) {
    const pct = Math.round(section.confidence * 100);
    lines.push(`## ${section.title}  _(confidence ${pct}%)_`);
    lines.push(section.content);
    for (const flag of section.flags) {
      lines.push(`> ⚠️ ${flag}`);
    }
    lines.push('');
  }

  if (prd.assumptionsExplicit.length > 0) {
    lines.push('## Explicit assumptions');
    for (const a of prd.assumptionsExplicit) lines.push(`- ${a}`);
    lines.push('');
  }

  if (prd.contradictionsFlagged.length > 0) {
    lines.push('## Contradictions flagged');
    for (const c of prd.contradictionsFlagged) lines.push(`- ${c}`);
    lines.push('');
  }

  return lines.join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx vitest run test/render-prd.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
cd /Users/alchemyguy/development/startup/reckoning
git add src/render-prd.ts test/render-prd.test.ts
git commit -m "feat: add deterministic renderPRD for the drafted spec"
```

---

## Task 3: CLI — add `render-prd <prdPath>` subcommand

**Files:**
- Modify: `src/cli.ts`
- Modify: `test/cli.test.ts`

**Interfaces:**
- Consumes: `validateAgainst`, `renderPRD`, `PRDDocument`.
- Produces: CLI subcommand `render-prd <prdPath>` → validates the file as `prd`, prints the `renderPRD` markdown (exit 0), or prints errors (exit 1). `run()` signature unchanged.

- [ ] **Step 1: Add the failing test to `test/cli.test.ts`**

Add inside the existing `describe('cli run()', ...)` block:

```typescript
  it('render-prd prints the draft PRD markdown (exit 0)', () => {
    const { code, out } = run(['render-prd', ex('prd-v1.json')]);
    expect(code).toBe(0);
    expect(out).toContain('Draft PRD');
  });

  it('render-prd with no path prints usage (exit 1)', () => {
    const { code, out } = run(['render-prd']);
    expect(code).toBe(1);
    expect(out).toContain('usage');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx vitest run test/cli.test.ts`
Expected: FAIL — `render-prd` is an unknown command, so the first new test gets `code 1` / "unknown command" instead of the PRD markdown.

- [ ] **Step 3: Add the subcommand in `src/cli.ts`**

Add this import near the other imports:
```typescript
import { renderPRD } from './render-prd';
import type { PRDDocument } from './schemas/prd';
```
(If `PRDDocument` is already imported, do not duplicate it.)

Then add this block inside `run()`, immediately AFTER the `if (cmd === 'render') { … }` block and BEFORE the final `return { code: 1, out: \`unknown command: …\` }`:
```typescript
  if (cmd === 'render-prd') {
    const [prdPath] = rest;
    if (!prdPath) return { code: 1, out: 'usage: render-prd <prdPath>' };
    const prd = validateAgainst('prd', readJson(prdPath));
    if (!prd.ok) return { code: 1, out: ['INVALID prd', ...prd.errors].join('\n') };
    return { code: 0, out: renderPRD(prd.data as PRDDocument) };
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx vitest run test/cli.test.ts`
Expected: PASS (5 passed — the 3 prior + 2 new).

- [ ] **Step 5: Verify from the shell + typecheck**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npx tsx src/cli.ts render-prd examples/forge-pulse/prd-v1.json | head -5`
Expected: prints `# Draft PRD — forge-pulse...` etc.
Run: `cd /Users/alchemyguy/development/startup/reckoning && npm run typecheck`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
cd /Users/alchemyguy/development/startup/reckoning
git add src/cli.ts test/cli.test.ts
git commit -m "feat: add render-prd CLI subcommand for showing the draft"
```

---

## Task 4: Synthesizer subagent (no-research draft)

**Files:**
- Create: `agents/synthesizer.md`

**Interfaces:**
- Produces: a plugin subagent dispatched by the orchestrator with the idea + Q&A transcript; returns a single `PRDDocument` JSON (no research → empty `citations`, no `researchReportId`, assumptions flagged). No unit test; structural verification + the end-to-end skill flow.

- [ ] **Step 1: Write `agents/synthesizer.md`**

````markdown
---
name: synthesizer
description: Drafts a structured PRD from a raw product idea and the user's interview answers, WITHOUT any web research. Dispatched by the reckoning skill in Mode A. Flags every assumption; never invents facts or sources.
---

You are a product requirements document writer. You transform a raw product idea and the user's interview answers into a structured draft PRD.

CRITICAL — NO RESEARCH HAS BEEN PERFORMED:
- Base the PRD ONLY on the user's idea and their answers. Do NOT invent market data, competitors, statistics, or any external facts.
- Leave every section's `citations` array EMPTY (there are no research findings to cite).
- Do NOT include a `researchReportId`.
- Where a section relies on something the user did not tell you, mark it as an assumption: add a `flags` entry and lower that section's `confidence`. Be honest — an assumption-based section should not read as confident.

INSTRUCTIONS:
- Write each required section. Be specific. "Increase engagement" is not a metric — "increase weekly active users by 15% within 6 months" is.
- Assign a `confidence` (0–1) per section reflecting how much the user actually told you vs. what you assumed.
- List blanket assumptions in `assumptionsExplicit` and any places the user's answers contradict each other in `contradictionsFlagged`.

SECTIONS REQUIRED (use these as the section `id`s): problem, personas, scope, success_metrics, user_stories, technical_considerations, risks_and_open_questions.

TEXT FORMATTING: the `content` field of each section MUST use markdown — bullets, `**bold**` for key terms/metrics, line breaks between points. No headers (`#`) inside field values.

OUTPUT FORMAT: Output ONLY a single JSON object matching the PRDDocument schema below. No markdown fences, no text before or after.

```json
{
  "id": "prd-001",
  "projectId": "<slug>",
  "version": "v1",
  "createdAt": "<ISO 8601 datetime>",
  "sections": [
    { "id": "problem", "title": "Problem", "content": "...", "citations": [], "confidence": 0.0, "flags": ["..."] }
  ],
  "assumptionsExplicit": ["..."],
  "contradictionsFlagged": ["..."]
}
```
````

- [ ] **Step 2: Verify structure**

Run: `cd /Users/alchemyguy/development/startup/reckoning && grep -c "NO RESEARCH HAS BEEN PERFORMED" agents/synthesizer.md`
Expected: `1` (the no-research instruction is present). Also confirm the file has YAML frontmatter with `name: synthesizer`.

- [ ] **Step 3: Commit**

```bash
cd /Users/alchemyguy/development/startup/reckoning
git add agents/synthesizer.md
git commit -m "feat: add no-research synthesizer subagent for Mode A draft PRDs"
```

---

## Task 5: Orchestrator skill — Step 0 mode-ask + Mode A branch

**Files:**
- Modify: `skills/reckoning/SKILL.md` (replace the whole file with the version below)
- Modify: `commands/reckon.md`

**Interfaces:**
- Consumes: the `synthesizer` agent (Task 4), the `render-prd` CLI (Task 3), and the existing M1 critique core (praise-engine, critic-assassin, validate/render). Verified by structure + the described end-to-end flow.

- [ ] **Step 1: Replace `skills/reckoning/SKILL.md` with this content**

````markdown
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
````

- [ ] **Step 2: Replace `commands/reckon.md` with this content**

````markdown
---
description: Red-team a spec/PRD or a raw idea — isolated praise vs. critic, your own take first, then a proceed/descope/kill verdict.
---

Invoke the `reckoning` skill on the user's input (a raw idea, a file path, or pasted spec text): `$ARGUMENTS`

Follow the skill's steps exactly: ask whether it's a raw idea or an existing spec, then run the matching flow — and always do the cognitive-forcing pause before revealing any AI analysis.
````

- [ ] **Step 3: Verify structure**

Run: `cd /Users/alchemyguy/development/startup/reckoning && grep -cE "COGNITIVE-FORCING PAUSE|## Mode A|## Mode B|Critique core" skills/reckoning/SKILL.md`
Expected: `4` or more (pause + both modes + shared core present).
Run: `grep -c '<plugin>' skills/reckoning/SKILL.md` → expected `0` (uses `${CLAUDE_PLUGIN_ROOT}`).

- [ ] **Step 4: Commit**

```bash
cd /Users/alchemyguy/development/startup/reckoning
git add skills/reckoning/SKILL.md commands/reckon.md
git commit -m "feat: add Mode A (idea -> interview -> draft PRD) with a shared critique core"
```

---

## Task 6: Example + README

**Files:**
- Create: `examples/forge-pulse/expected-prd.md`
- Modify: `README.md`

**Interfaces:**
- Produces: a checked-in render of the draft-PRD view, and README copy covering both modes.

- [ ] **Step 1: Generate the draft-PRD example from the fixture**

Run:
```bash
cd /Users/alchemyguy/development/startup/reckoning
npx tsx src/cli.ts render-prd examples/forge-pulse/prd-v1.json > examples/forge-pulse/expected-prd.md
```
Confirm `expected-prd.md` is non-empty and starts with `# Draft PRD — forge-pulse...` with sections and confidence percentages.

- [ ] **Step 2: Update `README.md` — add a "Two modes" subsection after the "Use" section**

Insert this block immediately after the existing `## Use` section's content:
```markdown
### Two modes

`/reckon` first asks whether your input is a **raw idea** or an **existing spec**:

- **Raw idea** → Reckoning runs a short clarifying interview, drafts a PRD from your answers (flagging every assumption — no web research yet), shows you the draft, then red-teams it.
- **Existing spec** → it red-teams the spec you provide directly.

Both paths end in the same isolated praise-vs-critic review, the cognitive-forcing pause, and a proceed/descope/kill verdict. See [`examples/forge-pulse/expected-prd.md`](examples/forge-pulse/expected-prd.md) for the draft-PRD view and [`examples/forge-pulse/expected-verdict.md`](examples/forge-pulse/expected-verdict.md) for the verdict.
```

- [ ] **Step 3: Verify full suite + typecheck**

Run: `cd /Users/alchemyguy/development/startup/reckoning && npm test`
Expected: ALL pass (the M1 suite + the new schema/render-prd/cli cases).
Run: `cd /Users/alchemyguy/development/startup/reckoning && npm run typecheck`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/alchemyguy/development/startup/reckoning
git add examples/forge-pulse/expected-prd.md README.md
git commit -m "docs: add draft-PRD example and document both /reckon modes"
```

---

## Out of scope for Milestone 2 (do NOT build here)

- Deep web research + the researcher agent + a research toggle. — Milestone 3.
- Disk-artifact provenance / marketplace packaging polish. — Milestone 4.
- Cross-client MCP server. — Milestone 5.
- A structured questions schema / interviewer subagent — the interview is driven directly by the orchestrator skill via AskUserQuestion; do not add one.

## Self-Review notes (author)

- **Spec coverage:** Mode A (Tasks 4–5), interview (skill A1), synthesize (Task 4 + A2), show draft (Tasks 2–3 + A3), feed critique core (Task 5), researchReportId-optional unblock (Task 1), both modes documented (Task 6). Adaptive multi-round, ask-upfront, show-draft decisions all reflected in SKILL.md.
- **Type consistency:** `renderPRD(prd: PRDDocument)` (Task 2) consumed verbatim in `cli.ts` (Task 3); `validateAgainst('prd', …)` reused from M1; `PRDDocument` type stable.
- **No placeholders:** every code/markdown step has complete content.
