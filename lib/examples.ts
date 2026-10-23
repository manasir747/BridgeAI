import { AnalysisCategory, UrgencyLevel, StructuredAnalysisResult } from '@/types/analysis';

export interface ScenarioPreset {
  id: string;
  title: string;
  category: AnalysisCategory;
  urgencyHint: UrgencyLevel;
  iconName: string;
  summary: string;
  rawInput: string;
}

export const HUMANITARIAN_PRESETS: ScenarioPreset[] = [
  {
    id: 'preset-flood-hospital',
    title: 'Flood Isolation & Hospital Power Failure',
    category: 'healthcare_access',
    urgencyHint: 'critical',
    iconName: 'Ambulance',
    summary: 'St. Jude Health Clinic flood evacuation needed for trapped dialysis patients.',
    rawInput:
      'URGENT: Flood waters reaching 2nd floor of St. Jude Community Health Clinic on 44 Riverside Rd. 4 elderly dialysis patients trapped without backup power, generator fuel exhausted in 40 mins. Oxygen running low. Cell battery 12%, call Nurse Sarah at 555-0199 or radio VHF-16. Need immediate high-clearance boat evacuation!',
  },
  {
    id: 'preset-quake-infrastructure',
    title: 'Earthquake Overpass Collapse & Gas Hazard',
    category: 'infrastructure_damage',
    urgencyHint: 'critical',
    iconName: 'AlertTriangle',
    summary: 'Structural collapse of interstate overpass with suspected natural gas rupture.',
    rawInput:
      'Bridge overpass collapsed over 8th Avenue near Maple St intersection. Multiple vehicles crushed underneath. Strong natural gas smell spreading towards 200-unit apartment complex. Road completely blocked, sirens heard in distance. Need gas utility shutoff, heavy rescue crane, and hazmat isolation perimeter immediately.',
  },
  {
    id: 'preset-shelter-food-water',
    title: 'Displaced Population Shelter & Infant Care',
    category: 'food_water_security',
    urgencyHint: 'high',
    iconName: 'Utensils',
    summary: 'Community shelter housing 130 displaced storm survivors lacking clean water and infant formula.',
    rawInput:
      'Community Center shelter at 105 West Pine St is now holding 130 evacuated residents including 18 infants and 32 elderly individuals. Municipal tap water contaminated with boil order. We have only 12 gallons of drinking water left and zero infant formula. Local coordinator Maria Santos: 555-0284. Need 500L bottled water, baby nutrition packs, and portable sanitary toilets.',
  },
  {
    id: 'preset-wildfire-evac',
    title: 'Wildfire Encroachment & Assisted Living',
    category: 'emergency_relief',
    urgencyHint: 'critical',
    iconName: 'Flame',
    summary: 'Approaching wildfire threatening nursing home with non-ambulatory residents.',
    rawInput:
      'Wildfire spotted cresting ridge 1.5 miles north of Oakridge Assisted Living on Pine Valley Hwy. 45 non-ambulatory residents cannot evacuate via standard cars. Heavy smoke entering ventilation. Dispatcher on local radio 155.340 MHz. Staff requesting 4 wheelchair-accessible transport vans and emergency respiratory masks before wind shifts in 1 hour.',
  },
];

export const CATEGORY_METADATA: Record<
  AnalysisCategory,
  { label: string; description: string; colorClass: string }
> = {
  emergency_relief: {
    label: 'Emergency Relief',
    description: 'Disaster response, search & rescue, evacuations',
    colorClass: 'text-red-600 bg-red-500/10 border-red-500/20',
  },
  healthcare_access: {
    label: 'Healthcare Access',
    description: 'Medical emergencies, clinics, oxygen, medication',
    colorClass: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
  },
  infrastructure_damage: {
    label: 'Infrastructure Damage',
    description: 'Roads, bridges, power grid, water mains, gas leaks',
    colorClass: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  },
  food_water_security: {
    label: 'Food & Water Security',
    description: 'Potable water, food distribution, infant formula',
    colorClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  },
  shelter_housing: {
    label: 'Shelter & Housing',
    description: 'Evacuation centers, temporary housing, heating/cooling',
    colorClass: 'text-sky-600 bg-sky-500/10 border-sky-500/20',
  },
  public_safety: {
    label: 'Public Safety',
    description: 'Hazards, security, evacuation corridors, traffic control',
    colorClass: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
  },
  missing_persons: {
    label: 'Missing Persons',
    description: 'Search inquiries, separated families, welfare checks',
    colorClass: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
  },
  community_assistance: {
    label: 'Community Assistance',
    description: 'Mutual aid, volunteer coordination, logistics',
    colorClass: 'text-teal-600 bg-teal-500/10 border-teal-500/20',
  },
  other: {
    label: 'General / Other',
    description: 'Miscellaneous humanitarian reports and alerts',
    colorClass: 'text-slate-600 bg-slate-500/10 border-slate-500/20',
  },
};

/**
 * Generates a realistic, clearly labelled simulated analysis result for fallback demo mode.
 * Explicitly indicates [Simulation / Demo Mode] so users and testers know it did not come from Gemini.
 */
export function generateDemoSimulationResult(
  input: string,
  categoryHint?: AnalysisCategory
): StructuredAnalysisResult {
  const category = categoryHint || 'emergency_relief';
  const now = new Date().toISOString();

  return {
    id: `sim-${Date.now()}`,
    rawInput: input,
    timestamp: now,
    summary: `[Demo Simulation] Structured triage extraction based on user input regarding ${category.replace(/_/g, ' ')}.`,
    category,
    urgency: {
      level: 'high',
      score: 8,
      reasoning:
        '[Simulated Assessment] Urgent response needed based on detected keywords and simulated triage rules. Field confirmation required.',
    },
    extractedDetails: {
      locations: [
        {
          name: 'Extracted Incident Zone',
          address: 'Refer to raw dispatch text',
          context: 'Primary target area',
        },
      ],
      entities: [
        {
          name: 'First Response Unit',
          type: 'organization',
          role: 'Incident commander',
        },
      ],
      affectedPopulation: {
        countEstimate: 25,
        description: 'Estimated impacted individuals identified in report',
        vulnerableGroups: ['General Public', 'Vulnerable cohorts'],
      },
      temporalInfo: {
        reportedTime: 'Recent dispatch',
        duration: 'Under active development',
      },
      contactInfo: [
        {
          type: 'radio',
          value: 'Local Emergency Dispatch Channel',
          name: 'Dispatch Control',
        },
      ],
      resourceNeeds: [
        {
          category: 'Logistics',
          item: 'Assessment team & emergency response vehicle',
          urgency: 'high',
        },
      ],
    },
    missingInformation: [
      {
        field: 'Exact GPS Coordinates',
        description: 'Pinpoint latitude and longitude for navigation routing.',
        criticality: 'high',
      },
      {
        field: 'On-scene Contact Callback',
        description: 'Secondary mobile or satellite telephone number.',
        criticality: 'medium',
      },
    ],
    verification: {
      status: 'needs_followup',
      confidenceScore: 0.85,
      reasoning:
        '[Simulated Verification] Internal syntactic coherence verified; field verification required prior to operational dispatch.',
    },
    sources: [
      {
        quote: input.slice(0, 100),
        relevance: 'Primary intake narrative snippet',
        confidence: 0.9,
      },
    ],
    recommendedActions: [
      {
        id: 'sim-act-1',
        title: 'Dispatch Ground Verification Team',
        description: 'Deploy nearest mobile unit to confirm on-scene conditions and report back.',
        priority: 'high',
        targetEntity: 'Ground Recon Team',
        status: 'pending',
      },
      {
        id: 'sim-act-2',
        title: 'Establish Secondary Communications Channel',
        description: 'Verify redundant radio frequency or backup telephone link.',
        priority: 'high',
        targetEntity: 'Communications Officer',
        status: 'pending',
      },
      {
        id: 'sim-act-3',
        title: 'Stage Contingency Supplies',
        description: 'Prepare logistical supplies at nearest forward operating base.',
        priority: 'medium',
        targetEntity: 'Logistics Depot',
        status: 'pending',
      },
    ],
    metadata: {
      modelVersion: 'simulated-demo-engine',
      processingTimeMs: 120,
      inputLength: input.length,
      sanitized: true,
      createdAt: now,
    },
  };
}
