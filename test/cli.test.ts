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
