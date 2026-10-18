import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error plain JS build script, no type declarations
import { buildSkills, SKILLS } from '../scripts/build-skills.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COMMITTED = join(ROOT, 'portable/skills');
const EXAMPLES = join(ROOT, 'examples/forge-pulse');
const names = Object.keys(SKILLS as Record<string, unknown>);

function listFiles(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`],
  );
}

describe('portable skills', () => {
  let fresh: string;
  beforeAll(async () => {
    fresh = await buildSkills(join(mkdtempSync(join(tmpdir(), 'reckoning-build-')), 'skills'));
  });

  it('committed portable/skills is up to date (run `npm run build:skills`)', () => {
    expect(listFiles(COMMITTED).sort()).toEqual(listFiles(fresh).sort());
    // Normalize line endings so a Windows checkout with autocrlf doesn't fail spuriously.
    const read = (p: string) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    for (const f of listFiles(fresh)) {
      expect(read(join(COMMITTED, f)), f).toBe(read(join(fresh, f)));
    }
  });

  it.each(names)('%s has frontmatter whose name matches its folder', (name) => {
    const md = readFileSync(join(COMMITTED, name, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
    expect(md).toMatch(new RegExp(`^---\\nname: ${name}\\ndescription: .{50,1024}\\n`));
    expect(md).toContain('`<skill-dir>` below means');
    expect(md).not.toContain('CLAUDE_PLUGIN_ROOT');
    expect(md).not.toContain('AskUserQuestion');
  });

  it.each(names)('%s script is short, readable and executable (security-scan friendly)', (name) => {
    const script = join(COMMITTED, name, 'scripts/reckoning.mjs');
    const src = readFileSync(script, 'utf8');
    expect(src.startsWith('#!/usr/bin/env node\n')).toBe(true);
    expect(src.length).toBeLessThan(40_000);
    expect(src).not.toContain('ZodError');
    expect(Math.max(...src.split('\n').map((l) => l.length))).toBeLessThan(200);
    if (process.platform !== 'win32') expect(statSync(script).mode & 0o111).not.toBe(0);
  });

  it.each(names)('%s bundled script runs with no node_modules', (name) => {
    // Copy the skill outside the repo so no node_modules can be resolved.
    const dir = join(mkdtempSync(join(tmpdir(), 'reckoning-skill-')), name);
    cpSync(join(COMMITTED, name), dir, { recursive: true });
    const script = join(dir, 'scripts/reckoning.mjs');
    const run = (...args: string[]) => execFileSync(process.execPath, [script, ...args], { encoding: 'utf8' });

    expect(run('validate', 'critical', join(EXAMPLES, 'critical-v1.json'))).toContain('OK');
    expect(run('render', join(EXAMPLES, 'critical-v1.json'), join(EXAMPLES, 'praise-v1.json'))).toContain(
      'Reckoning Verdict',
    );
    expect(run('render-critical', join(EXAMPLES, 'critical-v1.json'))).toContain('Reckoning Pre-mortem');
    expect(run('render-prd', join(EXAMPLES, 'idea-prd.json'))).toContain('Draft PRD');
    expect(() => run('validate', 'prd', join(EXAMPLES, 'critical-v1.json'))).toThrow(
      expect.objectContaining({ status: 1, stdout: expect.stringContaining('INVALID') }),
    );
  });
});
