import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
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
    for (const f of listFiles(fresh)) {
      expect(readFileSync(join(COMMITTED, f), 'utf8'), f).toBe(readFileSync(join(fresh, f), 'utf8'));
    }
  });

  it.each(names)('%s has frontmatter whose name matches its folder', (name) => {
    const md = readFileSync(join(COMMITTED, name, 'SKILL.md'), 'utf8');
    expect(md).toMatch(new RegExp(`^---\\nname: ${name}\\ndescription: .{50,1024}\\n`));
    expect(md).not.toContain('CLAUDE_PLUGIN_ROOT');
    expect(md).not.toContain('AskUserQuestion');
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
    expect(run('render-prd', join(EXAMPLES, 'idea-prd.json'))).toContain('Draft PRD');
  });
});
