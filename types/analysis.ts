/**
 * Standard categories for real-world societal benefit and crisis response intake.
 */
export type AnalysisCategory =
  | 'emergency_relief'
  | 'healthcare_access'
  | 'infrastructure_damage'
  | 'food_water_security'
  | 'shelter_housing'
  | 'public_safety'
  | 'missing_persons'
  | 'community_assistance'
  | 'other';

/**
 * Triage urgency levels for rapid routing and response prioritization.
 */
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Verification state of input facts and source reliability.
 */
export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'needs_followup'
  | 'conflicting';

/**
 * Criticality level of missing information.
 */
export type CriticalityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Action execution status.
 */
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

/**
 * Geographic or physical location mentioned in the report.
 */
export interface ExtractedLocation {
  name: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  context?: string;
}

/**
 * Identified individual, group, or agency.
 */
export interface ExtractedEntity {
  name: string;
  type: 'person' | 'organization' | 'facility' | 'group' | 'other';
  role?: string;
}

/**
 * Estimated impacted population counts and vulnerable cohorts.
 */
export interface AffectedPopulation {
  countEstimate?: number;
  description?: string;
  vulnerableGroups?: string[];
}

/**
 * Contact channel identified in the intake.
 */
export interface ContactInfo {
  type: 'phone' | 'email' | 'radio' | 'social' | 'other';
  value: string;
  name?: string;
}

/**
 * Specific material or logistical resource needs.
 */
export interface ResourceNeed {
  category: string;
  item: string;
  quantity?: string;
  urgency?: UrgencyLevel;
}

/**
 * Granular details parsed from messy, unstructured text.
 */
export interface ExtractedDetails {
  locations: ExtractedLocation[];
  entities: ExtractedEntity[];
  affectedPopulation?: AffectedPopulation;
  temporalInfo?: {
    reportedTime?: string;
    incidentTime?: string;
    duration?: string;
  };
  contactInfo: ContactInfo[];
  resourceNeeds: ResourceNeed[];
}

/**
 * Gaps or ambiguities in the input that require follow-up.
 */
export interface MissingInformation {
  field: string;
  description: string;
  criticality: CriticalityLevel;
}

/**
 * Urgency assessment and rationale.
 */
export interface UrgencyAssessment {
  level: UrgencyLevel;
  score: number; // 1 (lowest) to 10 (highest emergency)
  reasoning: string;
}

/**
 * Fact-checking and claim verification evaluation.
 */
export interface VerificationAssessment {
  status: VerificationStatus;
  confidenceScore: number; // 0.0 to 1.0
  reasoning: string;
}

/**
 * Direct quotes or extracted textual evidence supporting the analysis.
 */
export interface SourceEvidence {
  quote: string;
  relevance: string;
  confidence: number;
}

/**
 * Clear, prioritized operational step for aid workers or administrators.
 */
export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: UrgencyLevel;
  targetEntity?: string;
  status: ActionStatus;
}

/**
 * Execution metadata for auditability and observability.
 */
export interface AnalysisMetadata {
  modelVersion: string;
  processingTimeMs: number;
  inputLength: number;
  sanitized: boolean;
  createdAt: string;
}

/**
 * The complete canonical contract for BridgeAI structured output.
 */
export interface StructuredAnalysisResult {
  id: string;
  rawInput: string;
  timestamp: string;
  summary: string;
  category: AnalysisCategory;
  urgency: UrgencyAssessment;
  extractedDetails: ExtractedDetails;
  missingInformation: MissingInformation[];
  verification: VerificationAssessment;
  sources: SourceEvidence[];
  recommendedActions: RecommendedAction[];
  metadata: AnalysisMetadata;
}

/**
 * Client-to-server request contract for analysis.
 */
export interface AnalysisRequest {
  input: string;
  categoryHint?: AnalysisCategory;
  urgencyHint?: UrgencyLevel;
  locale?: string;
  language?: 'en' | 'hi' | 'mr';
}

/**
 * API response format for /api/analyze.
 */
export type AnalysisResponse =
  | {
      success: true;
      data: StructuredAnalysisResult;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    };
