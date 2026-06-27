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
