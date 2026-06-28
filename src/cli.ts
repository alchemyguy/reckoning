import { readFileSync } from 'node:fs';
import { validateAgainst, type SchemaName } from './validate';
import { renderVerdict } from './render';
import { renderPRD } from './render-prd';
import type { CriticalAnalysis } from './schemas/critical';
import type { PraiseAnalysis } from './schemas/praise';
import type { PRDDocument } from './schemas/prd';

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

  if (cmd === 'render-prd') {
    const [prdPath] = rest;
    if (!prdPath) return { code: 1, out: 'usage: render-prd <prdPath>' };
    const prd = validateAgainst('prd', readJson(prdPath));
    if (!prd.ok) return { code: 1, out: ['INVALID prd', ...prd.errors].join('\n') };
    return { code: 0, out: renderPRD(prd.data as PRDDocument) };
  }

  return { code: 1, out: `unknown command: ${cmd ?? '(none)'} (expected: validate | render | render-prd)` };
}

// Entry point when invoked directly (npx tsx src/cli.ts ...)
// The import.meta.url === `file://${process.argv[1]}` guard can silently fail under tsx
// due to symlink resolution mismatches. We check if process.argv[1] ends with 'cli.ts'
// (or 'cli.js' for compiled output) as a robust cross-platform fallback.
const isDirectInvocation =
  process.argv[1]?.endsWith('/cli.ts') ||
  process.argv[1]?.endsWith('/cli.js') ||
  import.meta.url === `file://${process.argv[1]}`;

if (isDirectInvocation) {
  const { code, out } = run(process.argv.slice(2));
  process.stdout.write(out + '\n');
  process.exit(code);
}
