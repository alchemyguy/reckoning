import { z } from 'zod';

export const CriticalItemSchema = z.object({
  id: z.string(),
  prdSectionId: z.string(),
  title: z.string(),
  consequence: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  likelihood: z.enum(['high', 'medium', 'low']),
  category: z.enum([
    'failure_modes',
    'scale_pain',
    'user_confusion_risks',
    'engineering_regrets',
  ]),
});

export const MarketSkepticVerdictSchema = z.object({
  question: z.string(),
  verdict: z.enum(['strong', 'moderate', 'weak']),
  detail: z.string(),
});

export const CriticalAnalysisSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  prdVersion: z.string(),
  createdAt: z.string().datetime(),
  modelUsed: z.string(),
  failureModes: z.array(CriticalItemSchema),
  scalePain: z.array(CriticalItemSchema),
  userConfusionRisks: z.array(CriticalItemSchema),
  engineeringRegrets: z.array(CriticalItemSchema),
  marketSkeptic: z.object({
    whyCare: MarketSkepticVerdictSchema,
    whyNow: MarketSkepticVerdictSchema,
    whyWin: MarketSkepticVerdictSchema,
    featureVsProduct: MarketSkepticVerdictSchema,
  }),
  killRecommendation: z.object({
    kill: z.boolean(),
    rationale: z.string(),
  }),
  overallAssessment: z.string(),
  confidence: z.number().min(0).max(1),
});

export type CriticalItem = z.infer<typeof CriticalItemSchema>;
export type MarketSkepticVerdict = z.infer<typeof MarketSkepticVerdictSchema>;
export type CriticalAnalysis = z.infer<typeof CriticalAnalysisSchema>;
