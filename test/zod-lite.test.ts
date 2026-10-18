import { describe, it, expect, beforeAll } from 'vitest';
import { validateAgainst, type SchemaName } from '../src/validate';
import { CriticalAnalysisSchema } from '../src/schemas/critical';
import { PraiseAnalysisSchema } from '../src/schemas/praise';
import { PRDDocumentSchema } from '../src/schemas/prd';
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type Validate = typeof validateAgainst;

// Bundle src/validate.ts exactly as the portable skills do (zod aliased to zod-lite),
// so the shipped validator is checked against the real zod schemas.
async function liteValidate(): Promise<Validate> {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const out = await build({
    entryPoints: [join(root, 'src/validate.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    alias: { zod: join(root, 'src/portable/zod-lite.ts') },
  });
  const text = out.outputFiles[0]!.text;
  expect(text).not.toContain('ZodError'); // real zod must not leak into the bundle
  const file = join(mkdtempSync(join(tmpdir(), 'zod-lite-')), 'validate.mjs');
  writeFileSync(file, text);
  return ((await import(pathToFileURL(file).href)) as { validateAgainst: Validate }).validateAgainst;
}

const real = { critical: CriticalAnalysisSchema, praise: PraiseAnalysisSchema, prd: PRDDocumentSchema };

function fixture(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL(`../examples/forge-pulse/${name}`, import.meta.url), 'utf8'));
}

const cases: [SchemaName, string][] = [
  ['critical', 'critical-v1.json'],
  ['praise', 'praise-v1.json'],
  ['prd', 'prd-v1.json'],
  ['prd', 'idea-prd.json'],
];

// Each mutation breaks one rule; zod-lite must reject exactly when zod does.
const mutations: [string, (d: Record<string, unknown>) => void][] = [
  ['unchanged', () => {}],
  ['missing id', (d) => delete d.id],
  ['id wrong type', (d) => (d.id = 42)],
  ['bad datetime', (d) => (d.createdAt = '2026-06-28')],
  ['datetime with offset', (d) => (d.createdAt = '2026-06-28T12:00:00+05:30')],
  ['datetime with fraction', (d) => (d.createdAt = '2026-06-28T12:00:00.123Z')],
  ['confidence > 1', (d) => (d.confidence = 1.5)],
  ['confidence < 0', (d) => (d.confidence = -0.1)],
  ['extra key', (d) => (d.extra = 'ignored')],
  ['id is null', (d) => (d.id = null)],
  ['array of non-objects', (d) => {
    for (const key of ['sections', 'strengths', 'failureModes']) if (key in d) d[key] = ['not an object'];
  }],
];

describe('zod-lite parity with zod', () => {
  let lite: Validate;
  beforeAll(async () => {
    lite = await liteValidate();
  });
  for (const [name, file] of cases) {
    for (const [label, mutate] of mutations) {
      it(`${file}: ${label}`, () => {
        const data = fixture(file);
        mutate(data);
        expect(lite(name, data).ok).toBe(real[name].safeParse(data).success);
      });
    }
  }

  it('rejects a non-object root', () => {
    expect(lite('prd', [])).toMatchObject({ ok: false });
    expect(real.prd.safeParse([]).success).toBe(false);
  });

  it('rejects a bad enum and reports a readable path', () => {
    const data = fixture('critical-v1.json');
    (data.failureModes as Record<string, unknown>[])[0]!.severity = 'apocalyptic';
    const result = lite('critical', data);
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual([
      expect.stringMatching(/^failureModes\.0\.severity: Invalid enum value/),
    ]);
    expect(validateAgainst('critical', data)).toMatchObject({ ok: false });
  });
});
