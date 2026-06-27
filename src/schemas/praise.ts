import { z } from 'zod';

export const PraiseItemSchema = z.object({
  id: z.string(),
  prdSectionId: z.string(),
  title: z.string(),
  detail: z.string(),
  whyItWorks: z.string(),
  evidence: z.string(),
  strengthLevel: z.enum(['strong', 'notable', 'solid']),
  doNotRegress: z.boolean(),
});

export const NonObviousInsightSchema = z.object({
  id: z.string(),
  prdSectionId: z.string(),
  title: z.string(),
  detail: z.string(),
  whyNonObvious: z.string(),
});

export const PraiseAnalysisSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  prdVersion: z.string(),
  createdAt: z.string().datetime(),
  modelUsed: z.string(),
  strengths: z.array(PraiseItemSchema),
  nonObviousInsights: z.array(NonObviousInsightSchema),
  overallAssessment: z.string(),
  confidence: z.number().min(0).max(1),
});

export type PraiseItem = z.infer<typeof PraiseItemSchema>;
export type NonObviousInsight = z.infer<typeof NonObviousInsightSchema>;
export type PraiseAnalysis = z.infer<typeof PraiseAnalysisSchema>;
