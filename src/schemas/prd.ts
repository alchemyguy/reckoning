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
