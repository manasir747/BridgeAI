import { Type, type Schema } from '@google/genai';

/**
 * Native Google GenAI Schema for Gemini structured output.
 * Enforces the BridgeAI canonical structure at the model generation layer.
 */
export const geminiAnalysisResponseSchema: Schema = {
  type: Type.OBJECT,
  description: 'Structured societal benefit analysis for real-world unstructured inputs',
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Concise, objective 1-3 sentence summary of the core situation or request.',
    },
    category: {
      type: Type.STRING,
      enum: [
        'emergency_relief',
        'healthcare_access',
        'infrastructure_damage',
        'food_water_security',
        'shelter_housing',
        'public_safety',
        'missing_persons',
        'community_assistance',
        'other',
      ],
      description: 'Primary category classifying this event or issue.',
    },
    urgency: {
      type: Type.OBJECT,
      description: 'Assessment of time-sensitivity and danger to life or safety.',
      properties: {
        level: {
          type: Type.STRING,
          enum: ['critical', 'high', 'medium', 'low'],
        },
        score: {
          type: Type.INTEGER,
          description: 'Urgency severity score from 1 (low) to 10 (immediate life threat).',
        },
        reasoning: {
          type: Type.STRING,
          description: 'Detailed factual justification for the urgency rating.',
        },
      },
      required: ['level', 'score', 'reasoning'],
    },
    extractedDetails: {
      type: Type.OBJECT,
      description: 'Factual entities, locations, needs, and contacts extracted strictly from the input.',
      properties: {
        locations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Location name or landmark' },
              address: { type: Type.STRING, description: 'Street address if known' },
              context: { type: Type.STRING, description: 'Situational context' },
            },
            required: ['name'],
          },
        },
        entities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Entity or person name' },
              type: {
                type: Type.STRING,
                enum: ['person', 'organization', 'facility', 'group', 'other'],
              },
              role: { type: Type.STRING, description: 'Role or involvement' },
            },
            required: ['name', 'type'],
          },
        },
        affectedPopulation: {
          type: Type.OBJECT,
          properties: {
            countEstimate: { type: Type.INTEGER, description: 'Estimated number of affected people' },
            description: { type: Type.STRING, description: 'Description of affected community' },
            vulnerableGroups: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
        temporalInfo: {
          type: Type.OBJECT,
          properties: {
            reportedTime: { type: Type.STRING },
            incidentTime: { type: Type.STRING },
            duration: { type: Type.STRING },
          },
        },
        contactInfo: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                enum: ['phone', 'email', 'radio', 'social', 'other'],
              },
              value: { type: Type.STRING },
              name: { type: Type.STRING },
            },
            required: ['type', 'value'],
          },
        },
        resourceNeeds: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              item: { type: Type.STRING },
              quantity: { type: Type.STRING },
              urgency: {
                type: Type.STRING,
                enum: ['critical', 'high', 'medium', 'low'],
              },
            },
            required: ['category', 'item'],
          },
        },
      },
    },
    missingInformation: {
      type: Type.ARRAY,
      description: 'Crucial missing details needed to respond effectively.',
      items: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING, description: 'Name of missing field or question' },
          description: { type: Type.STRING, description: 'Why this information is needed' },
          criticality: {
            type: Type.STRING,
            enum: ['critical', 'high', 'medium', 'low'],
          },
        },
        required: ['field', 'description', 'criticality'],
      },
    },
    verification: {
      type: Type.OBJECT,
      description: 'Assessment of evidence, credibility, and verification status.',
      properties: {
        status: {
          type: Type.STRING,
          enum: ['verified', 'unverified', 'needs_followup', 'conflicting'],
        },
        confidenceScore: {
          type: Type.NUMBER,
          description: 'Confidence float from 0.0 to 1.0 (e.g. 0.85).',
        },
        reasoning: {
          type: Type.STRING,
          description: 'Justification for the verification status.',
        },
      },
      required: ['status', 'confidenceScore', 'reasoning'],
    },
    sources: {
      type: Type.ARRAY,
      description: 'Direct verbatim quotes from the input serving as evidence.',
      items: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING, description: 'Verbatim text excerpt' },
          relevance: { type: Type.STRING, description: 'Relevance to the findings' },
          confidence: { type: Type.NUMBER, description: 'Confidence float between 0.0 and 1.0' },
        },
        required: ['quote', 'relevance', 'confidence'],
      },
    },
    recommendedActions: {
      type: Type.ARRAY,
      description: 'Prioritized actionable next steps for responders or aid groups.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Clear action title' },
          description: { type: Type.STRING, description: 'Actionable instructions' },
          priority: {
            type: Type.STRING,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          targetEntity: { type: Type.STRING, description: 'Party responsible for taking this action' },
        },
        required: ['title', 'description', 'priority'],
      },
    },
  },
  required: [
    'summary',
    'category',
    'urgency',
    'extractedDetails',
    'missingInformation',
    'verification',
    'sources',
    'recommendedActions',
  ],
};
