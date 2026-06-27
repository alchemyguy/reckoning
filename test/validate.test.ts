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
