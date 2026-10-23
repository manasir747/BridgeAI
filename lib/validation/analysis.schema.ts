import { z } from 'zod';

export const analysisCategorySchema = z.enum([
  'emergency_relief',
  'healthcare_access',
  'infrastructure_damage',
  'food_water_security',
  'shelter_housing',
  'public_safety',
  'missing_persons',
  'community_assistance',
  'other',
]);

export const urgencyLevelSchema = z.enum(['critical', 'high', 'medium', 'low']);

export const verificationStatusSchema = z.enum([
  'verified',
  'unverified',
  'needs_followup',
  'conflicting',
]);

export const criticalityLevelSchema = z.enum(['critical', 'high', 'medium', 'low']);

export const actionStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'blocked']);

export const extractedLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  context: z.string().optional(),
});

export const extractedEntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  type: z.enum(['person', 'organization', 'facility', 'group', 'other']),
  role: z.string().optional(),
});

export const affectedPopulationSchema = z.object({
  countEstimate: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
  vulnerableGroups: z.array(z.string()).default([]),
});

export const contactInfoSchema = z.object({
  type: z.enum(['phone', 'email', 'radio', 'social', 'other']),
  value: z.string().min(1),
  name: z.string().optional(),
});

export const resourceNeedSchema = z.object({
  category: z.string().min(1),
  item: z.string().min(1),
  quantity: z.string().optional(),
  urgency: urgencyLevelSchema.optional(),
});

export const extractedDetailsSchema = z.object({
  locations: z.array(extractedLocationSchema).default([]),
  entities: z.array(extractedEntitySchema).default([]),
  affectedPopulation: affectedPopulationSchema.optional(),
  temporalInfo: z
    .object({
      reportedTime: z.string().optional(),
      incidentTime: z.string().optional(),
      duration: z.string().optional(),
    })
    .optional(),
  contactInfo: z.array(contactInfoSchema).default([]),
  resourceNeeds: z.array(resourceNeedSchema).default([]),
});

export const missingInformationSchema = z.object({
  field: z.string().min(1),
  description: z.string().min(1),
  criticality: criticalityLevelSchema,
});

export const urgencyAssessmentSchema = z.object({
  level: urgencyLevelSchema,
  score: z.number().min(1).max(10),
  reasoning: z.string().min(1),
});

export const verificationAssessmentSchema = z.object({
  status: verificationStatusSchema,
  confidenceScore: z.number().min(0).max(1),
  reasoning: z.string().min(1),
});

export const sourceEvidenceSchema = z.object({
  quote: z.string().min(1),
  relevance: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const recommendedActionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: urgencyLevelSchema,
  targetEntity: z.string().optional(),
  status: actionStatusSchema.default('pending'),
});

export const analysisMetadataSchema = z.object({
  modelVersion: z.string().min(1),
  processingTimeMs: z.number().nonnegative(),
  inputLength: z.number().nonnegative(),
  sanitized: z.boolean(),
  createdAt: z.string().min(1),
});

export const structuredAnalysisSchema = z.object({
  id: z.string().min(1),
  rawInput: z.string().min(1),
  timestamp: z.string().min(1),
  summary: z.string().min(1),
  category: analysisCategorySchema,
  urgency: urgencyAssessmentSchema,
  extractedDetails: extractedDetailsSchema,
  missingInformation: z.array(missingInformationSchema).default([]),
  verification: verificationAssessmentSchema,
  sources: z.array(sourceEvidenceSchema).default([]),
  recommendedActions: z.array(recommendedActionSchema).default([]),
  metadata: analysisMetadataSchema,
});

export type StructuredAnalysisSchemaType = z.infer<typeof structuredAnalysisSchema>;
