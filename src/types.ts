/**
 * Types TypeScript pour ARTU MBËNN MI
 */

export type RiskLevelKey = 'tres-faible' | 'faible' | 'modere' | 'eleve' | 'tres-eleve';
export type ScreenId = 'dashboard' | 'map' | 'trigger' | 'journal' | 'field-reports' | 'beneficiaries' | 'settings';
export type AlertTier = 'vigilance' | 'alerte' | string;

export interface RiskLevelDefinition {
  id: string;
  label: string;
  colorHex: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  symbolShape: string;
  severityTier: number;
  description: string;
}

export interface ZoneData {
  id: string;
  name: string;
  riskLevel: 'très faible' | 'faible' | 'modéré' | 'élevé' | 'très élevé';
  riskScore: number;
  confidence: number;
  population: number;
  lastAlertLabel: string;
  rainfallForecastMm: number;
  topographyProfile: string;
  criticalSites: string;
  leadTimeHours: number;
  svgCoords: {
    path: string;
    cx: number;
    cy: number;
    labelPos: { x: number; y: number };
  };
  timeProgression: {
    [key: string]: {
      score: number;
      level: string;
      rainMm: number;
    };
  };
}

export interface SuggestedDecision {
  action: string;
  targetZones: string[];
  targetCount: number;
  deadlineText: string;
  rationale: string;
}

export interface CommuneData {
  id: string;
  name: string;
  region: string;
  department: string;
  overallRisk: string;
  leadTime: string;
  modelConfidencePercent: number;
  lastUpdateIso: string;
  lastUpdateLabel: string;
  weatherDataSource: string;
  sensorFreshnessHours: number;
  suggestedDecision: SuggestedDecision;
  zones: ZoneData[];
}

export interface PastAlert {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  commune: string;
  zones: string[];
  level: AlertTier;
  recipientCount: number;
  triggerAgent: string;
  agentId: string;
  openRatePercent: number;
  status: string;
  falseAlert?: boolean;
  postAnalysisNote?: string;
}
