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
