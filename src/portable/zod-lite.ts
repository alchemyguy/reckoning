// A small, readable stand-in for the subset of zod used by src/schemas/*.
// The portable skills bundle this instead of zod (esbuild alias in
// scripts/build-skills.mjs) so the shipped scripts/reckoning.mjs stays short and
// auditable — marketplace security scans reject large vendored/minified code.
// test/zod-lite.test.ts checks it agrees with real zod on valid and invalid input.

type Path = (string | number)[];

export interface ZodIssue {
  path: Path;
  message: string;
}

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ZodIssue[] } };

function describe(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

abstract class Schema<T> {
  // Returns the parsed value; pushes issues for anything invalid.
  abstract check(value: unknown, path: Path, issues: ZodIssue[]): T;

  optional(): Schema<T | undefined> {
    return new OptionalSchema(this);
  }

  safeParse(value: unknown): SafeParseResult<T> {
    const issues: ZodIssue[] = [];
    const data = this.check(value, [], issues);
    return issues.length === 0 ? { success: true, data } : { success: false, error: { issues } };
  }
}

function typeIssue(expected: string, value: unknown, path: Path, issues: ZodIssue[]): void {
  issues.push({
    path,
    message: value === undefined ? 'Required' : `Expected ${expected}, received ${describe(value)}`,
  });
}

class OptionalSchema<T> extends Schema<T | undefined> {
  constructor(private inner: Schema<T>) {
    super();
  }
  check(value: unknown, path: Path, issues: ZodIssue[]): T | undefined {
    return value === undefined ? undefined : this.inner.check(value, path, issues);
  }
}

// ISO 8601 datetime with seconds, optional fraction, and a Z or ±HH[:MM] offset.
const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}(:?\d{2})?)$/;

class StringSchema extends Schema<string> {
  private requireDatetime = false;
  datetime(_opts?: { offset?: boolean }): StringSchema {
    this.requireDatetime = true;
    return this;
  }
  check(value: unknown, path: Path, issues: ZodIssue[]): string {
    if (typeof value !== 'string') {
      typeIssue('string', value, path, issues);
      return value as string;
    }
    if (this.requireDatetime && !DATETIME.test(value)) issues.push({ path, message: 'Invalid datetime' });
    return value;
  }
}

class NumberSchema extends Schema<number> {
  private lo = -Infinity;
  private hi = Infinity;
  min(n: number): NumberSchema {
    this.lo = n;
    return this;
  }
  max(n: number): NumberSchema {
    this.hi = n;
    return this;
  }
  check(value: unknown, path: Path, issues: ZodIssue[]): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      typeIssue('number', value, path, issues);
      return value as number;
    }
    if (value < this.lo) issues.push({ path, message: `Number must be greater than or equal to ${this.lo}` });
    if (value > this.hi) issues.push({ path, message: `Number must be less than or equal to ${this.hi}` });
    return value;
  }
}

class BooleanSchema extends Schema<boolean> {
  check(value: unknown, path: Path, issues: ZodIssue[]): boolean {
    if (typeof value !== 'boolean') typeIssue('boolean', value, path, issues);
    return value as boolean;
  }
}

class EnumSchema<V extends string> extends Schema<V> {
  constructor(private values: readonly V[]) {
    super();
  }
  check(value: unknown, path: Path, issues: ZodIssue[]): V {
    if (!this.values.includes(value as V)) {
      const expected = this.values.map((v) => `'${v}'`).join(' | ');
      issues.push({ path, message: `Invalid enum value. Expected ${expected}, received '${String(value)}'` });
    }
    return value as V;
  }
}

class ArraySchema<T> extends Schema<T[]> {
  constructor(private item: Schema<T>) {
    super();
  }
  check(value: unknown, path: Path, issues: ZodIssue[]): T[] {
    if (!Array.isArray(value)) {
      typeIssue('array', value, path, issues);
      return value as T[];
    }
    return value.map((v, i) => this.item.check(v, [...path, i], issues));
  }
}

type Shape = Record<string, Schema<unknown>>;
type InferShape<S extends Shape> = { [K in keyof S]: S[K] extends Schema<infer T> ? T : never };

class ObjectSchema<S extends Shape> extends Schema<InferShape<S>> {
  constructor(private shape: S) {
    super();
  }
  check(value: unknown, path: Path, issues: ZodIssue[]): InferShape<S> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      typeIssue('object', value, path, issues);
      return value as InferShape<S>;
    }
    // Like zod's default, unknown keys are stripped from the output.
    const out: Record<string, unknown> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      const parsed = schema.check((value as Record<string, unknown>)[key], [...path, key], issues);
      if (parsed !== undefined) out[key] = parsed;
    }
    return out as InferShape<S>;
  }
}

export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  enum: <V extends string>(values: readonly [V, ...V[]]) => new EnumSchema(values),
  array: <T>(item: Schema<T>) => new ArraySchema(item),
  object: <S extends Shape>(shape: S) => new ObjectSchema(shape),
};
