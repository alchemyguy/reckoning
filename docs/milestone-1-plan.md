# Reckoning — Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working Claude Code plugin `reckoning` whose `/reckon` command critiques an *existing* spec/PRD (Mode B, research off): cognitive-forcing pause → two isolated subagents (Praise + Critic/Market-Skeptic) → Zod-validated JSON → deterministically-rendered severity-ranked verdict.

**Architecture:** A **hybrid plugin** = a prompt layer (markdown agents + orchestrator skill + command) over a small, unit-tested TypeScript core. The skill dispatches Praise and Critic as *isolated subagents* (separate contexts, parallel, zero shared state); each returns JSON; the skill shells out to the TS core (`reckoning validate`, `reckoning render`) for hard Zod validation and deterministic markdown rendering. Inference is the user's own Claude Code session — no API keys, no tokens. The TS core is intentionally minimal (schemas + validate + verdict + render + cli); no server, no framework.

**Tech Stack:** Node 24 LTS, TypeScript (strict), Zod (validation), Vitest (tests), tsx (run TS without a build step). Distribution: Claude Code plugin (`.claude-plugin/plugin.json`) — pure-markdown agents/skill + a `src/` TS core invoked via `npx tsx`.

## Global Constraints

- **Node** `>=24.0.0`. **TypeScript strict.** **NEVER use `any`** — use proper types/interfaces (project rule).
- **All agent JSON output MUST be validated with Zod before it is rendered or used** (project rule `.claude/rules/agents.md`).
- **Praise and Critic run as isolated subagents — separate contexts, in parallel, zero shared state.** Neither may see the other's output (project rule + spec §4).
- **No secrets, no API keys, no OAuth tokens anywhere.** Inference is the host Claude Code session.
- **Path-safety:** when reading a user-supplied spec path, reject path-traversal; only read inside the current working directory tree (project rule `.claude/rules/security.md`).
- **Commits:** Conventional Commit messages. Commit frequently (one per task minimum). **NEVER add a `Co-Authored-By` trailer or any co-author attribution** (user global rule).
- **Plugin folder:** everything for this milestone lives under `reckoning/` at the repo root. Fixtures are copied from `data/projects/forge-pulse-fast-feedback-team-heartbeat/`.
- **ESM:** `"type": "module"`, `moduleResolution: "bundler"` (extensionless imports). Run the CLI with `npx tsx reckoning/src/cli.ts ...`.

---

## File Structure

```
reckoning/
├── .claude-plugin/plugin.json        # plugin manifest
├── package.json                      # zod + vitest + tsx; bin: reckoning
├── tsconfig.json
├── vitest.config.ts
├── commands/reckon.md                # /reckon entry point
├── skills/reckoning/SKILL.md         # orchestrator (Mode B only in M1)
├── agents/
│   ├── praise-engine.md              # isolated strengths analyst
│   └── critic-assassin.md            # isolated critic + market skeptic
├── src/
│   ├── schemas/
│   │   ├── critical.ts               # ported Zod schema
│   │   ├── praise.ts                 # ported Zod schema
│   │   └── prd.ts                    # ported Zod schema (normalized spec)
│   ├── validate.ts                   # validateAgainst(name, data)
│   ├── verdict.ts                    # deriveVerdict(critical) -> PROCEED|DESCOPE|KILL
│   ├── render.ts                     # renderVerdict(critical, praise) -> markdown
│   └── cli.ts                        # `reckoning validate|render ...`
├── test/
│   ├── schemas.test.ts
│   ├── validate.test.ts
│   ├── verdict.test.ts
│   └── render.test.ts
├── examples/forge-pulse/             # copied fixtures: prd-v1, praise-v1, critical-v1
├── README.md
└── LICENSE
```

**Responsibilities:** `schemas/` = the data contracts; `validate.ts` = the only place JSON crosses into typed land; `verdict.ts` = the proceed/descope/kill decision rule (isolated so it is independently testable); `render.ts` = deterministic markdown; `cli.ts` = the thin shell the skill calls. The markdown layer (`agents/`, `skills/`, `commands/`) is the prompt/orchestration; it holds no business logic beyond flow.

---

## Task 1: Scaffold plugin + tooling

**Files:**
- Create: `reckoning/package.json`, `reckoning/tsconfig.json`, `reckoning/vitest.config.ts`, `reckoning/.claude-plugin/plugin.json`, `reckoning/.gitignore`
- Test: `reckoning/test/smoke.test.ts`

**Interfaces:**
- Produces: a runnable Vitest setup (`npm test` inside `reckoning/`) and a valid plugin manifest. Nothing else depends on this beyond tooling.

- [ ] **Step 1: Create a feature branch**

Run:
```bash
git checkout -b reckoning-m1
```
Expected: `Switched to a new branch 'reckoning-m1'`

- [ ] **Step 2: Write `reckoning/package.json`**

```json
{
  "name": "reckoning",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Make AI attack your spec instead of flattering it.",
  "bin": { "reckoning": "src/cli.ts" },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "reckon": "tsx src/cli.ts"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@types/node": "^24.0.0"
  },
  "engines": { "node": ">=24.0.0" }
}
```

- [ ] **Step 3: Write `reckoning/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 4: Write `reckoning/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 5: Write `reckoning/.claude-plugin/plugin.json`**

```json
{
  "name": "reckoning",
  "version": "0.1.0",
  "description": "Make AI attack your spec instead of flattering it. Isolated praise vs. critic, you commit your own take first, then a proceed/descope/kill verdict.",
  "commands": ["./commands/reckon.md"],
  "skills": ["./skills/reckoning"],
  "agents": ["./agents/praise-engine.md", "./agents/critic-assassin.md"]
}
```

- [ ] **Step 6: Write `reckoning/.gitignore`**

```
node_modules/
*.log
```

- [ ] **Step 7: Write the smoke test `reckoning/test/smoke.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('scaffold', () => {
  it('plugin manifest is valid JSON with a name', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url), 'utf8'),
    );
    expect(manifest.name).toBe('reckoning');
  });
});
```

- [ ] **Step 8: Install deps and run the test**

Run:
```bash
cd reckoning && npm install && npm test
```
Expected: install succeeds; Vitest runs; `smoke.test.ts` PASSES (1 passed).

- [ ] **Step 9: Commit**

```bash
git add reckoning/package.json reckoning/tsconfig.json reckoning/vitest.config.ts reckoning/.claude-plugin reckoning/.gitignore reckoning/test/smoke.test.ts
git commit -m "feat(reckoning): scaffold plugin manifest and TS/test tooling"
```

---

## Task 2: Critical schema + fixture validation

**Files:**
- Create: `reckoning/src/schemas/critical.ts`
- Create: `reckoning/examples/forge-pulse/critical-v1.json` (copied fixture)
- Test: `reckoning/test/schemas.test.ts`

**Interfaces:**
- Produces: `CriticalAnalysisSchema` (Zod), `CriticalItemSchema`, `MarketSkepticVerdictSchema`, and types `CriticalAnalysis`, `CriticalItem`, `MarketSkepticVerdict`. Consumed by `validate.ts`, `verdict.ts`, `render.ts`.

- [ ] **Step 1: Copy the fixture**

Run:
```bash
mkdir -p reckoning/examples/forge-pulse
cp data/projects/forge-pulse-fast-feedback-team-heartbeat/analysis/critical-v1.json reckoning/examples/forge-pulse/critical-v1.json
```
Expected: file copied (no output).

- [ ] **Step 2: Write the failing test `reckoning/test/schemas.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CriticalAnalysisSchema } from '../src/schemas/critical';

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  );
}

describe('CriticalAnalysisSchema', () => {
  it('accepts the forge-pulse critical fixture', () => {
    const result = CriticalAnalysisSchema.safeParse(fixture('critical-v1.json'));
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/schemas.test.ts`
Expected: FAIL — cannot resolve `../src/schemas/critical`.

- [ ] **Step 4: Write `reckoning/src/schemas/critical.ts`**

```typescript
import { z } from 'zod';

export const CriticalItemSchema = z.object({
  id: z.string(),
  prdSectionId: z.string(),
  title: z.string(),
  consequence: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  likelihood: z.enum(['high', 'medium', 'low']),
  category: z.enum([
    'failure_modes',
    'scale_pain',
    'user_confusion_risks',
    'engineering_regrets',
  ]),
});

export const MarketSkepticVerdictSchema = z.object({
  question: z.string(),
  verdict: z.enum(['strong', 'moderate', 'weak']),
  detail: z.string(),
});

export const CriticalAnalysisSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  prdVersion: z.string(),
  createdAt: z.string().datetime(),
  modelUsed: z.string(),
  failureModes: z.array(CriticalItemSchema),
  scalePain: z.array(CriticalItemSchema),
  userConfusionRisks: z.array(CriticalItemSchema),
  engineeringRegrets: z.array(CriticalItemSchema),
  marketSkeptic: z.object({
    whyCare: MarketSkepticVerdictSchema,
    whyNow: MarketSkepticVerdictSchema,
    whyWin: MarketSkepticVerdictSchema,
    featureVsProduct: MarketSkepticVerdictSchema,
  }),
  killRecommendation: z.object({
    kill: z.boolean(),
    rationale: z.string(),
  }),
  overallAssessment: z.string(),
  confidence: z.number().min(0).max(1),
});

export type CriticalItem = z.infer<typeof CriticalItemSchema>;
export type MarketSkepticVerdict = z.infer<typeof MarketSkepticVerdictSchema>;
export type CriticalAnalysis = z.infer<typeof CriticalAnalysisSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/schemas.test.ts`
Expected: PASS (1 passed). If it fails on a `createdAt` datetime issue, confirm the fixture timestamp is ISO-8601 with `Z`; do not loosen the schema to accept malformed data.

- [ ] **Step 6: Commit**

```bash
git add reckoning/src/schemas/critical.ts reckoning/examples/forge-pulse/critical-v1.json reckoning/test/schemas.test.ts
git commit -m "feat(reckoning): add critical analysis schema validated against forge-pulse fixture"
```

---

## Task 3: Praise schema + fixture validation

**Files:**
- Create: `reckoning/src/schemas/praise.ts`
- Create: `reckoning/examples/forge-pulse/praise-v1.json` (copied fixture)
- Modify: `reckoning/test/schemas.test.ts` (add a praise case)

**Interfaces:**
- Produces: `PraiseAnalysisSchema`, `PraiseItemSchema`, `NonObviousInsightSchema`, and types `PraiseAnalysis`, `PraiseItem`, `NonObviousInsight`. Consumed by `validate.ts`, `render.ts`.

- [ ] **Step 1: Copy the fixture**

Run:
```bash
cp data/projects/forge-pulse-fast-feedback-team-heartbeat/analysis/praise-v1.json reckoning/examples/forge-pulse/praise-v1.json
```

- [ ] **Step 2: Add the failing test to `reckoning/test/schemas.test.ts`**

Append inside the file (after the existing `describe`):

```typescript
import { PraiseAnalysisSchema } from '../src/schemas/praise';

describe('PraiseAnalysisSchema', () => {
  it('accepts the forge-pulse praise fixture', () => {
    const result = PraiseAnalysisSchema.safeParse(fixture('praise-v1.json'));
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/schemas.test.ts`
Expected: FAIL — cannot resolve `../src/schemas/praise`.

- [ ] **Step 4: Write `reckoning/src/schemas/praise.ts`**

```typescript
import { z } from 'zod';

export const PraiseItemSchema = z.object({
  id: z.string(),
  prdSectionId: z.string(),
  title: z.string(),
  detail: z.string(),
  whyItWorks: z.string(),
  evidence: z.string(),
  strengthLevel: z.enum(['strong', 'notable', 'solid']),
  doNotRegress: z.boolean(),
});

export const NonObviousInsightSchema = z.object({
  id: z.string(),
  prdSectionId: z.string(),
  title: z.string(),
  detail: z.string(),
  whyNonObvious: z.string(),
});

export const PraiseAnalysisSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  prdVersion: z.string(),
  createdAt: z.string().datetime(),
  modelUsed: z.string(),
  strengths: z.array(PraiseItemSchema),
  nonObviousInsights: z.array(NonObviousInsightSchema),
  overallAssessment: z.string(),
  confidence: z.number().min(0).max(1),
});

export type PraiseItem = z.infer<typeof PraiseItemSchema>;
export type NonObviousInsight = z.infer<typeof NonObviousInsightSchema>;
export type PraiseAnalysis = z.infer<typeof PraiseAnalysisSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/schemas.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 6: Commit**

```bash
git add reckoning/src/schemas/praise.ts reckoning/examples/forge-pulse/praise-v1.json reckoning/test/schemas.test.ts
git commit -m "feat(reckoning): add praise analysis schema validated against forge-pulse fixture"
```

---

## Task 4: PRD schema + fixture validation

**Files:**
- Create: `reckoning/src/schemas/prd.ts`
- Create: `reckoning/examples/forge-pulse/prd-v1.json` (copied fixture)
- Modify: `reckoning/test/schemas.test.ts` (add a prd case)

**Interfaces:**
- Produces: `PRDDocumentSchema`, `PRDSectionSchema`, and types `PRDDocument`, `PRDSection`. Consumed by `validate.ts` (Mode B normalizes a spec into this shape; in M1 it validates an already-PRD-shaped fixture).

- [ ] **Step 1: Copy the fixture**

Run:
```bash
cp data/projects/forge-pulse-fast-feedback-team-heartbeat/prd/prd-v1.json reckoning/examples/forge-pulse/prd-v1.json
```

- [ ] **Step 2: Add the failing test to `reckoning/test/schemas.test.ts`**

Append:

```typescript
import { PRDDocumentSchema } from '../src/schemas/prd';

describe('PRDDocumentSchema', () => {
  it('accepts the forge-pulse prd fixture', () => {
    const result = PRDDocumentSchema.safeParse(fixture('prd-v1.json'));
    if (!result.success) console.error(result.error.issues);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/schemas.test.ts`
Expected: FAIL — cannot resolve `../src/schemas/prd`.

- [ ] **Step 4: Write `reckoning/src/schemas/prd.ts`**

```typescript
import { z } from 'zod';

export const CitationSchema = z.object({
  findingId: z.string(),
  context: z.string(),
});

export const PRDSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  citations: z.array(CitationSchema),
  confidence: z.number().min(0).max(1),
  flags: z.array(z.string()),
});

export const PRDDocumentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  version: z.string(),
  researchReportId: z.string(),
  sealedHash: z.string().optional(),
  createdAt: z.string().datetime(),
  sections: z.array(PRDSectionSchema),
  assumptionsExplicit: z.array(z.string()),
  contradictionsFlagged: z.array(z.string()),
});

export type Citation = z.infer<typeof CitationSchema>;
export type PRDSection = z.infer<typeof PRDSectionSchema>;
export type PRDDocument = z.infer<typeof PRDDocumentSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/schemas.test.ts`
Expected: PASS (3 passed). If validation fails because the fixture legitimately omits an optional field (e.g. `researchReportId` for a hand-written spec), mark that specific field `.optional()` — do NOT relax field *types* to paper over malformed data.

- [ ] **Step 6: Commit**

```bash
git add reckoning/src/schemas/prd.ts reckoning/examples/forge-pulse/prd-v1.json reckoning/test/schemas.test.ts
git commit -m "feat(reckoning): add PRD document schema validated against forge-pulse fixture"
```

---

## Task 5: `validate.ts` — the typed boundary

**Files:**
- Create: `reckoning/src/validate.ts`
- Test: `reckoning/test/validate.test.ts`

**Interfaces:**
- Consumes: the three schemas from Tasks 2–4.
- Produces: `type SchemaName = 'critical' | 'praise' | 'prd'`; `validateAgainst(name: SchemaName, data: unknown): ValidationResult` where `ValidationResult = { ok: true; data: unknown } | { ok: false; errors: string[] }`. Consumed by `cli.ts`.

- [ ] **Step 1: Write the failing test `reckoning/test/validate.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateAgainst } from '../src/validate';

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  );
}

describe('validateAgainst', () => {
  it('returns ok:true for a valid critical fixture', () => {
    const result = validateAgainst('critical', fixture('critical-v1.json'));
    expect(result.ok).toBe(true);
  });

  it('returns ok:false with readable errors for invalid data', () => {
    const result = validateAgainst('critical', { id: 'x' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain(':'); // "path: message" shape
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/validate.test.ts`
Expected: FAIL — cannot resolve `../src/validate`.

- [ ] **Step 3: Write `reckoning/src/validate.ts`**

```typescript
import { z } from 'zod';
import { CriticalAnalysisSchema } from './schemas/critical';
import { PraiseAnalysisSchema } from './schemas/praise';
import { PRDDocumentSchema } from './schemas/prd';

const schemas = {
  critical: CriticalAnalysisSchema,
  praise: PraiseAnalysisSchema,
  prd: PRDDocumentSchema,
} as const;

export type SchemaName = keyof typeof schemas;

export type ValidationResult =
  | { ok: true; data: unknown }
  | { ok: false; errors: string[] };

export function validateAgainst(name: SchemaName, data: unknown): ValidationResult {
  const result = schemas[name].safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const errors = result.error.issues.map((issue: z.ZodIssue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
    return `${path}: ${issue.message}`;
  });
  return { ok: false, errors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/validate.test.ts`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add reckoning/src/validate.ts reckoning/test/validate.test.ts
git commit -m "feat(reckoning): add validateAgainst typed boundary with readable errors"
```

---

## Task 6: `verdict.ts` — proceed/descope/kill rule

**Files:**
- Create: `reckoning/src/verdict.ts`
- Test: `reckoning/test/verdict.test.ts`

**Interfaces:**
- Consumes: `CriticalAnalysis` type from `schemas/critical`.
- Produces: `type Verdict = 'PROCEED' | 'DESCOPE' | 'KILL'`; `deriveVerdict(critical: CriticalAnalysis): { verdict: Verdict; reason: string }`. Consumed by `render.ts`.

**Rule (deterministic):**
- `kill === true` → `KILL`.
- else if ≥1 `critical`-severity item (across all four arrays) OR ≥2 `weak` market-skeptic verdicts → `DESCOPE`.
- else → `PROCEED`.

- [ ] **Step 1: Write the failing test `reckoning/test/verdict.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { deriveVerdict } from '../src/verdict';
import type { CriticalAnalysis } from '../src/schemas/critical';

function base(): CriticalAnalysis {
  const skeptic = (verdict: 'strong' | 'moderate' | 'weak') => ({
    question: 'q',
    verdict,
    detail: 'd',
  });
  return {
    id: 'c',
    projectId: 'p',
    prdVersion: 'v1',
    createdAt: '2026-01-01T00:00:00Z',
    modelUsed: 'm',
    failureModes: [],
    scalePain: [],
    userConfusionRisks: [],
    engineeringRegrets: [],
    marketSkeptic: {
      whyCare: skeptic('strong'),
      whyNow: skeptic('strong'),
      whyWin: skeptic('strong'),
      featureVsProduct: skeptic('strong'),
    },
    killRecommendation: { kill: false, rationale: '' },
    overallAssessment: '',
    confidence: 0.8,
  };
}

describe('deriveVerdict', () => {
  it('returns KILL when killRecommendation.kill is true', () => {
    const c = base();
    c.killRecommendation = { kill: true, rationale: 'fatal' };
    expect(deriveVerdict(c).verdict).toBe('KILL');
  });

  it('returns DESCOPE when there is a critical-severity item', () => {
    const c = base();
    c.failureModes = [
      {
        id: 'fm',
        prdSectionId: 's',
        title: 't',
        consequence: 'x',
        severity: 'critical',
        likelihood: 'high',
        category: 'failure_modes',
      },
    ];
    expect(deriveVerdict(c).verdict).toBe('DESCOPE');
  });

  it('returns DESCOPE when two market verdicts are weak', () => {
    const c = base();
    c.marketSkeptic.whyWin.verdict = 'weak';
    c.marketSkeptic.featureVsProduct.verdict = 'weak';
    expect(deriveVerdict(c).verdict).toBe('DESCOPE');
  });

  it('returns PROCEED when no critical items and <2 weak verdicts', () => {
    expect(deriveVerdict(base()).verdict).toBe('PROCEED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/verdict.test.ts`
Expected: FAIL — cannot resolve `../src/verdict`.

- [ ] **Step 3: Write `reckoning/src/verdict.ts`**

```typescript
import type { CriticalAnalysis, CriticalItem } from './schemas/critical';

export type Verdict = 'PROCEED' | 'DESCOPE' | 'KILL';

export function allItems(critical: CriticalAnalysis): CriticalItem[] {
  return [
    ...critical.failureModes,
    ...critical.scalePain,
    ...critical.userConfusionRisks,
    ...critical.engineeringRegrets,
  ];
}

export function deriveVerdict(critical: CriticalAnalysis): { verdict: Verdict; reason: string } {
  if (critical.killRecommendation.kill) {
    return { verdict: 'KILL', reason: critical.killRecommendation.rationale };
  }

  const criticalCount = allItems(critical).filter((i) => i.severity === 'critical').length;
  const weakVerdicts = Object.values(critical.marketSkeptic).filter(
    (v) => v.verdict === 'weak',
  ).length;

  if (criticalCount >= 1 || weakVerdicts >= 2) {
    return {
      verdict: 'DESCOPE',
      reason: `${criticalCount} critical failure mode(s) and ${weakVerdicts} weak market verdict(s) — fix before building.`,
    };
  }

  return {
    verdict: 'PROCEED',
    reason: 'No critical blockers; proceed with the noted medium/low risks.',
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/verdict.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add reckoning/src/verdict.ts reckoning/test/verdict.test.ts
git commit -m "feat(reckoning): add deriveVerdict proceed/descope/kill rule"
```

---

## Task 7: `render.ts` — deterministic markdown verdict

**Files:**
- Create: `reckoning/src/render.ts`
- Test: `reckoning/test/render.test.ts`

**Interfaces:**
- Consumes: `CriticalAnalysis`, `PraiseAnalysis` types; `deriveVerdict`, `allItems` from `verdict.ts`.
- Produces: `renderVerdict(critical: CriticalAnalysis, praise: PraiseAnalysis): string`. Consumed by `cli.ts`.

- [ ] **Step 1: Write the failing test `reckoning/test/render.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderVerdict } from '../src/render';
import type { CriticalAnalysis } from '../src/schemas/critical';
import type { PraiseAnalysis } from '../src/schemas/praise';

function fixture<T>(name: string): T {
  return JSON.parse(
    readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'),
  ) as T;
}

describe('renderVerdict', () => {
  const critical = fixture<CriticalAnalysis>('critical-v1.json');
  const praise = fixture<PraiseAnalysis>('praise-v1.json');
  const md = renderVerdict(critical, praise);

  it('renders a verdict banner', () => {
    expect(md).toMatch(/Verdict: (PROCEED|DESCOPE|KILL)/);
  });

  it('renders the strengths and market-skeptic sections', () => {
    expect(md).toContain('Strengths');
    expect(md).toContain('Market skeptic');
    expect(md).toContain('Why care?');
  });

  it('renders failure modes sorted with critical first', () => {
    expect(md).toContain('Failure modes');
    const firstCritical = md.indexOf('[critical/');
    const firstLow = md.indexOf('[low/');
    if (firstCritical !== -1 && firstLow !== -1) {
      expect(firstCritical).toBeLessThan(firstLow);
    }
  });

  it('marks do-not-regress strengths', () => {
    const hasDoNotRegress = praise.strengths.some((s) => s.doNotRegress);
    if (hasDoNotRegress) expect(md).toContain('DO NOT REGRESS');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/render.test.ts`
Expected: FAIL — cannot resolve `../src/render`.

- [ ] **Step 3: Write `reckoning/src/render.ts`**

```typescript
import type { CriticalAnalysis, CriticalItem } from './schemas/critical';
import type { PraiseAnalysis } from './schemas/praise';
import { deriveVerdict, allItems } from './verdict';

const SEVERITY_RANK: Record<CriticalItem['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STRENGTH_RANK: Record<PraiseAnalysis['strengths'][number]['strengthLevel'], number> = {
  strong: 0,
  notable: 1,
  solid: 2,
};

export function renderVerdict(critical: CriticalAnalysis, praise: PraiseAnalysis): string {
  const { verdict, reason } = deriveVerdict(critical);
  const lines: string[] = [];

  lines.push(`# Reckoning Verdict — ${critical.projectId} (${critical.prdVersion})`);
  lines.push('');
  lines.push(`## ⚖️ Verdict: ${verdict}`);
  lines.push(reason);
  lines.push('');

  lines.push('## ✅ Strengths');
  const strengths = [...praise.strengths].sort(
    (a, b) => STRENGTH_RANK[a.strengthLevel] - STRENGTH_RANK[b.strengthLevel],
  );
  for (const s of strengths) {
    const badge = s.doNotRegress ? ' · 🔒 DO NOT REGRESS' : '';
    lines.push(`- **${s.title}** [${s.strengthLevel}]${badge} — §${s.prdSectionId}`);
    lines.push(`  ${s.whyItWorks}`);
  }
  lines.push('');

  lines.push('## 🔴 Failure modes (by severity)');
  const items = [...allItems(critical)].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
  for (const i of items) {
    lines.push(`- **[${i.severity}/${i.likelihood}] ${i.title}** (${i.category} · §${i.prdSectionId})`);
    lines.push(`  ${i.consequence}`);
  }
  lines.push('');

  lines.push('## 🧭 Market skeptic');
  const ms = critical.marketSkeptic;
  lines.push(`- **Why care?** [${ms.whyCare.verdict}] ${ms.whyCare.detail}`);
  lines.push(`- **Why now?** [${ms.whyNow.verdict}] ${ms.whyNow.detail}`);
  lines.push(`- **Why win?** [${ms.whyWin.verdict}] ${ms.whyWin.detail}`);
  lines.push(`- **Feature or product?** [${ms.featureVsProduct.verdict}] ${ms.featureVsProduct.detail}`);
  lines.push('');

  lines.push('## 📋 Overall');
  lines.push(critical.overallAssessment);
  lines.push('');
  lines.push(
    `_Critic confidence: ${critical.confidence} · Praise confidence: ${praise.confidence}_`,
  );

  return lines.join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/render.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add reckoning/src/render.ts reckoning/test/render.test.ts
git commit -m "feat(reckoning): add deterministic markdown verdict renderer"
```

---

## Task 8: `cli.ts` — the shell the skill calls

**Files:**
- Create: `reckoning/src/cli.ts`
- Test: `reckoning/test/cli.test.ts`

**Interfaces:**
- Consumes: `validateAgainst` (Task 5), `renderVerdict` (Task 7), schemas (Tasks 2–4).
- Produces: a CLI with two subcommands invoked as `npx tsx src/cli.ts <cmd> ...`:
  - `validate <critical|praise|prd> <jsonPath>` → prints `OK` and exits 0, or prints `INVALID` + one error per line and exits 1.
  - `render <criticalPath> <praisePath>` → validates both, prints the markdown verdict to stdout (exit 0), or prints errors and exits 1.
- Also exports `run(argv: string[]): { code: number; out: string }` so it is testable without spawning a process.

- [ ] **Step 1: Write the failing test `reckoning/test/cli.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { run } from '../src/cli';

function ex(name: string): string {
  return fileURLToPath(new URL(`../examples/forge-pulse/${name}`, import.meta.url));
}

describe('cli run()', () => {
  it('validate prints OK for a valid file (exit 0)', () => {
    const { code, out } = run(['validate', 'critical', ex('critical-v1.json')]);
    expect(code).toBe(0);
    expect(out).toContain('OK');
  });

  it('validate prints errors and exits 1 for invalid schema name', () => {
    const { code, out } = run(['validate', 'bogus', ex('critical-v1.json')]);
    expect(code).toBe(1);
    expect(out).toContain('unknown schema');
  });

  it('render prints the verdict markdown (exit 0)', () => {
    const { code, out } = run(['render', ex('critical-v1.json'), ex('praise-v1.json')]);
    expect(code).toBe(0);
    expect(out).toContain('Reckoning Verdict');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd reckoning && npx vitest run test/cli.test.ts`
Expected: FAIL — cannot resolve `../src/cli`.

- [ ] **Step 3: Write `reckoning/src/cli.ts`**

```typescript
import { readFileSync } from 'node:fs';
import { validateAgainst, type SchemaName } from './validate';
import { renderVerdict } from './render';
import type { CriticalAnalysis } from './schemas/critical';
import type { PraiseAnalysis } from './schemas/praise';

const SCHEMA_NAMES: readonly SchemaName[] = ['critical', 'praise', 'prd'];

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function run(argv: string[]): { code: number; out: string } {
  const [cmd, ...rest] = argv;

  if (cmd === 'validate') {
    const [name, path] = rest;
    if (!name || !SCHEMA_NAMES.includes(name as SchemaName)) {
      return { code: 1, out: `unknown schema: ${name ?? '(none)'} (expected one of ${SCHEMA_NAMES.join(', ')})` };
    }
    if (!path) return { code: 1, out: 'usage: validate <schema> <jsonPath>' };
    const result = validateAgainst(name as SchemaName, readJson(path));
    if (result.ok) return { code: 0, out: 'OK' };
    return { code: 1, out: ['INVALID', ...result.errors].join('\n') };
  }

  if (cmd === 'render') {
    const [criticalPath, praisePath] = rest;
    if (!criticalPath || !praisePath) {
      return { code: 1, out: 'usage: render <criticalPath> <praisePath>' };
    }
    const critical = validateAgainst('critical', readJson(criticalPath));
    if (!critical.ok) return { code: 1, out: ['INVALID critical', ...critical.errors].join('\n') };
    const praise = validateAgainst('praise', readJson(praisePath));
    if (!praise.ok) return { code: 1, out: ['INVALID praise', ...praise.errors].join('\n') };
    const md = renderVerdict(critical.data as CriticalAnalysis, praise.data as PraiseAnalysis);
    return { code: 0, out: md };
  }

  return { code: 1, out: `unknown command: ${cmd ?? '(none)'} (expected: validate | render)` };
}

// Entry point when invoked directly (npx tsx src/cli.ts ...)
if (import.meta.url === `file://${process.argv[1]}`) {
  const { code, out } = run(process.argv.slice(2));
  process.stdout.write(out + '\n');
  process.exit(code);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd reckoning && npx vitest run test/cli.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Verify the CLI runs end-to-end from the shell**

Run: `cd reckoning && npx tsx src/cli.ts render examples/forge-pulse/critical-v1.json examples/forge-pulse/praise-v1.json`
Expected: prints the full `# Reckoning Verdict — forge-pulse...` markdown, exit 0.

- [ ] **Step 6: Run the full test suite**

Run: `cd reckoning && npm test`
Expected: all suites PASS (smoke + schemas + validate + verdict + render + cli).

- [ ] **Step 7: Commit**

```bash
git add reckoning/src/cli.ts reckoning/test/cli.test.ts
git commit -m "feat(reckoning): add validate/render CLI with testable run()"
```

---

## Task 9: Agent definitions (isolated subagents)

**Files:**
- Create: `reckoning/agents/praise-engine.md`
- Create: `reckoning/agents/critic-assassin.md`

**Interfaces:**
- Produces: two plugin subagents. Each is dispatched by the orchestrator skill (Task 10) with the spec text as input and MUST return a single JSON object matching its schema (praise → `praise` schema; critic → `critical` schema). No code; verification is structural + the end-to-end run in Task 11.

- [ ] **Step 1: Write `reckoning/agents/praise-engine.md`**

````markdown
---
name: praise-engine
description: Isolated product strengths analyst. Given a PRD/spec, returns a PraiseAnalysis JSON of durable strengths and non-obvious good decisions. Dispatched by the reckoning skill; never run alongside the critic in a shared context.
---

You are a product strengths analyst. Your job is to identify what is GOOD about this PRD/spec and why it should be preserved.

INSTRUCTIONS:
- Read the provided spec. Identify durable strengths.
- Be SPECIFIC. "Good problem statement" is useless. "Problem statement cites 3 independent sources showing 40% user churn, making the pain point undeniable" is useful.
- For each strength, explain WHY it works and what makes it defensible.
- Mark "Do Not Regress" on strengths that are load-bearing — if removed, the spec would collapse.
- Find non-obvious good decisions: things the author did right that aren't immediately visible.
- Link every strength to a specific spec section by its id (use the section heading slug if the spec has no ids).
- Rate each: "strong", "notable", or "solid".

YOU ARE ISOLATED. You cannot see the Critic's output. This is intentional — do not hedge toward "balance."

TEXT FORMATTING: All text fields (detail, whyItWorks, evidence, whyNonObvious, overallAssessment) MUST use markdown — bullets (`- `), bold (`**`), line breaks between points. Do NOT use headers (`#`) inside field values.

OUTPUT FORMAT: Output ONLY a single JSON object matching the PraiseAnalysis schema below. No markdown fences, no text before or after.

```json
{
  "id": "praise-001",
  "projectId": "<slug>",
  "prdVersion": "v1",
  "createdAt": "<ISO 8601 datetime>",
  "modelUsed": "<model name>",
  "strengths": [
    { "id": "str-001", "prdSectionId": "<section>", "title": "...", "detail": "...", "whyItWorks": "...", "evidence": "...", "strengthLevel": "strong|notable|solid", "doNotRegress": true }
  ],
  "nonObviousInsights": [
    { "id": "noi-001", "prdSectionId": "<section>", "title": "...", "detail": "...", "whyNonObvious": "..." }
  ],
  "overallAssessment": "...",
  "confidence": 0.0
}
```
````

- [ ] **Step 2: Write `reckoning/agents/critic-assassin.md`**

````markdown
---
name: critic-assassin
description: Isolated product critic and market skeptic. Given a PRD/spec, returns a CriticalAnalysis JSON of failure modes, scale pain, confusion risks, engineering regrets, market-skeptic verdicts, and a kill recommendation. Dispatched by the reckoning skill; never run alongside the praise engine in a shared context.
---

You are a product critic and market skeptic. Your job is to find every way this PRD/spec could fail.

CRITIC INSTRUCTIONS:
- Find every failure mode with its specific consequence. Not "this might fail" but "if onboarding takes >3 minutes, 60% will drop off based on industry benchmarks."
- Rate severity: critical (blocks launch), high (significant problems), medium (friction), low (minor).
- Rate likelihood: high, medium, low.
- Categories: failure_modes, scale_pain, user_confusion_risks, engineering_regrets.
- Link every critique to a specific spec section by its id (use the section heading slug if the spec has no ids).

MARKET SKEPTIC INSTRUCTIONS — answer each, rating "strong" | "moderate" | "weak":
- Why would anyone care? Is the problem painful enough to pay for?
- Why now? What changed that makes this the right time?
- Why would you win? What's the defensible advantage?
- Feature or product? Could a competitor add this in a sprint?

KILL RECOMMENDATION: Based on ALL analysis, should this be killed? true/false + rationale. Reserve "kill" for fundamentally flawed ideas, not fixable problems.

YOU ARE ISOLATED. You cannot see the Praise Engine's output. This is intentional — no politeness, no hedging.

TEXT FORMATTING: All text fields (consequence, detail, rationale, overallAssessment) MUST use markdown — bullets, bold, line breaks. No headers (`#`) inside field values.

OUTPUT FORMAT: Output ONLY a single JSON object matching the CriticalAnalysis schema below. No markdown fences, no text before or after.

```json
{
  "id": "critical-001",
  "projectId": "<slug>",
  "prdVersion": "v1",
  "createdAt": "<ISO 8601 datetime>",
  "modelUsed": "<model name>",
  "failureModes": [
    { "id": "fm-001", "prdSectionId": "<section>", "title": "...", "consequence": "...", "severity": "critical|high|medium|low", "likelihood": "high|medium|low", "category": "failure_modes" }
  ],
  "scalePain": [ { "id": "sp-001", "prdSectionId": "<section>", "title": "...", "consequence": "...", "severity": "...", "likelihood": "...", "category": "scale_pain" } ],
  "userConfusionRisks": [ { "id": "uc-001", "prdSectionId": "<section>", "title": "...", "consequence": "...", "severity": "...", "likelihood": "...", "category": "user_confusion_risks" } ],
  "engineeringRegrets": [ { "id": "er-001", "prdSectionId": "<section>", "title": "...", "consequence": "...", "severity": "...", "likelihood": "...", "category": "engineering_regrets" } ],
  "marketSkeptic": {
    "whyCare": { "question": "Why would anyone care?", "verdict": "strong|moderate|weak", "detail": "..." },
    "whyNow": { "question": "Why now?", "verdict": "strong|moderate|weak", "detail": "..." },
    "whyWin": { "question": "Why would you win?", "verdict": "strong|moderate|weak", "detail": "..." },
    "featureVsProduct": { "question": "Feature or product?", "verdict": "strong|moderate|weak", "detail": "..." }
  },
  "killRecommendation": { "kill": false, "rationale": "..." },
  "overallAssessment": "...",
  "confidence": 0.0
}
```
````

- [ ] **Step 3: Verify structure**

Run: `cd reckoning && grep -l "YOU ARE ISOLATED" agents/*.md | wc -l`
Expected: `2` (both agents carry the isolation clause).

- [ ] **Step 4: Commit**

```bash
git add reckoning/agents/praise-engine.md reckoning/agents/critic-assassin.md
git commit -m "feat(reckoning): add isolated praise and critic subagent definitions"
```

---

## Task 10: Orchestrator skill + command (Mode B)

**Files:**
- Create: `reckoning/skills/reckoning/SKILL.md`
- Create: `reckoning/commands/reckon.md`

**Interfaces:**
- Consumes: the two agents (Task 9) and the CLI (Task 8).
- Produces: the `/reckon` entry point and the orchestration that ties everything together for Mode B. No code; verified by the end-to-end run in Task 11.

- [ ] **Step 1: Write `reckoning/skills/reckoning/SKILL.md`**

````markdown
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
- Write each subagent's JSON to a temp file (e.g. `/tmp/reckoning-critical.json`, `/tmp/reckoning-praise.json`).
- Validate each:
  `npx tsx <plugin>/src/cli.ts validate critical /tmp/reckoning-critical.json`
  `npx tsx <plugin>/src/cli.ts validate praise /tmp/reckoning-praise.json`
  If either prints `INVALID`, show the errors, ask that subagent to fix its JSON, and re-validate. Do not proceed on invalid output.
- Render the verdict:
  `npx tsx <plugin>/src/cli.ts render /tmp/reckoning-critical.json /tmp/reckoning-praise.json`

## Step 4 — PRESENT
- Show the rendered verdict markdown.
- Then append a **cognitive-forcing diff**: compare the user's Step-1 answer to the AI's findings. Call out: what the user flagged that the AI confirmed, what the AI found that the user missed, and where they disagree. This is the payoff — keep it short and direct.

Notes:
- `<plugin>` is this plugin's install directory. Run `npm install` in it once if dependencies are missing.
- Mode A (raw idea → questions → draft PRD → critique) and the research toggle are out of scope for this version; if the user gives an idea rather than a spec, ask them to provide a written spec for now.
````

- [ ] **Step 2: Write `reckoning/commands/reckon.md`**

````markdown
---
description: Red-team a spec/PRD — isolated praise vs. critic, your own take first, then a proceed/descope/kill verdict.
---

Invoke the `reckoning` skill to critique the spec the user provides (a file path or pasted text): `$ARGUMENTS`

Follow the skill's steps exactly, including the cognitive-forcing pause before revealing any AI analysis.
````

- [ ] **Step 3: Verify structure**

Run: `cd reckoning && grep -c "COGNITIVE-FORCING PAUSE" skills/reckoning/SKILL.md`
Expected: `1` (the pause step is present).

- [ ] **Step 4: Commit**

```bash
git add reckoning/skills/reckoning/SKILL.md reckoning/commands/reckon.md
git commit -m "feat(reckoning): add Mode B orchestrator skill and /reckon command"
```

---

## Task 11: Docs, example, and end-to-end verification

**Files:**
- Create: `reckoning/README.md`
- Create: `reckoning/LICENSE`
- Create: `reckoning/examples/forge-pulse/expected-verdict.md` (generated)

**Interfaces:**
- Produces: the launch-grade README (cognitive-forcing-led positioning), license, and a checked-in example verdict proving the engine works end-to-end.

- [ ] **Step 1: Generate the example verdict from the real fixtures**

Run:
```bash
cd reckoning && npx tsx src/cli.ts render examples/forge-pulse/critical-v1.json examples/forge-pulse/praise-v1.json > examples/forge-pulse/expected-verdict.md
```
Expected: `expected-verdict.md` contains a `# Reckoning Verdict — forge-pulse...` report with a verdict banner, strengths (with DO NOT REGRESS badges), severity-sorted failure modes, market-skeptic verdicts, and overall assessment.

- [ ] **Step 2: Write `reckoning/LICENSE`** (MIT)

```text
MIT License

Copyright (c) 2026 <your name>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Write `reckoning/README.md`**

```markdown
# Reckoning

**Make AI attack your spec instead of flattering it.**

Most AI makes your spec longer. Reckoning makes it survive contact with reality. It runs an **isolated** strongest-case and harshest-case review of your spec — the praise engine and the critic never see each other, so you get a real bull case and a real bear case, not one hedged "balanced" take. And before it shows you anything, **it makes you commit your own assessment first** — then diffs your judgment against the AI's. It ends with a verdict: **proceed / descope / kill**.

Runs entirely on your own Claude Code session. No API key, no account, no per-call cost.

## Install

This is a Claude Code plugin. (Marketplace install instructions — coming with the public release.)

```bash
cd reckoning && npm install
```

## Use

```
/reckon path/to/your-spec.md
```

You'll be asked for your own take first. Then Reckoning dispatches two isolated subagents, validates their output against strict schemas, and renders a severity-ranked verdict.

## Why it's different

- **Isolated adversarial review** — praise and critic run in separate contexts; neither anchors the other.
- **Cognitive forcing** — you commit your judgment before the AI reveals its own. The fix for anchoring on the machine.
- **Structured & severity-ranked** — typed findings, consistent run-to-run, with a real proceed/descope/kill verdict.

## Example

See [`examples/forge-pulse/expected-verdict.md`](examples/forge-pulse/expected-verdict.md) for a real verdict generated from a sample PRD.

## License

MIT
```

- [ ] **Step 4: Run the full suite one more time**

Run: `cd reckoning && npm test`
Expected: ALL tests pass.

- [ ] **Step 5: End-to-end smoke of the engine (manual)**

Run: `cd reckoning && npx tsx src/cli.ts render examples/forge-pulse/critical-v1.json examples/forge-pulse/praise-v1.json | head -20`
Expected: the verdict header + banner + strengths render correctly.

- [ ] **Step 6: Commit**

```bash
git add reckoning/README.md reckoning/LICENSE reckoning/examples/forge-pulse/expected-verdict.md
git commit -m "docs(reckoning): add README, license, and example verdict"
```

---

## Out of scope for Milestone 1 (do NOT build here)

- Mode A (raw idea → questions → research → draft PRD). — Milestone 2.
- Deep web research toggle + researcher agent. — Milestone 3.
- Disk-artifact provenance, marketplace packaging polish, compiled `dist/`. — Milestone 4.
- Cross-client MCP server. — Milestone 5 (separate plan).

## Self-Review notes (author)

- **Spec coverage:** isolated fan-out (Tasks 9–10), cognitive forcing (Task 10 Step 1), structured schemas (Tasks 2–4), Zod validation before render (Tasks 5, 8, 10), proceed/descope/kill verdict (Tasks 6–7), Mode B (Task 10), runs on host session / no keys (architecture + global constraints), plugin form (Task 1). Mode A, research, provenance, MCP are explicitly deferred per spec §10 build order.
- **Type consistency:** `validateAgainst` / `SchemaName` / `ValidationResult` (Task 5) reused verbatim in `cli.ts` (Task 8); `deriveVerdict` / `allItems` (Task 6) reused in `render.ts` (Task 7); schema type names (`CriticalAnalysis`, `PraiseAnalysis`, `PRDDocument`) consistent across tasks.
- **No placeholders:** every code/markdown step contains complete content.
```
