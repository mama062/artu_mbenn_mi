/**
 * ARTU MBËNN MI — Données de démonstration opérationnelles
 * 
 * Ce module simule les retours d'un backend FastAPI intégrant :
 * 1. Télédétection satellitaire (Sentinel-1 / GPM IMERG NASA)
 * 2. Modèle hydrologique communal et pluviométrie prévisionnelle ECMWF
 * 3. Registre communal de population et passerelle d'alerte WhatsApp vocale
 */

export const RISK_LEVELS = {
  VERY_LOW: {
    id: 'tres-faible',
    label: 'très faible',
    colorHex: '#2A7B88',
    bgLight: '#E8F5F7',
    bgDark: '#0D2D34',
    borderLight: '#A3D4DC',
    borderDark: '#1B5461',
    symbolShape: '○',
    severityTier: 1,
    description: 'Aucun risque significatif de submersion sous 48h.'
  },
  LOW: {
    id: 'faible',
    label: 'faible',
    colorHex: '#2E9E78',
    bgLight: '#E7F7F0',
    bgDark: '#0D3627',
    borderLight: '#A6E4CC',
    borderDark: '#1A6148',
    symbolShape: '◇',
    severityTier: 2,
    description: 'Accumulations localisées mineures sans entrave majeure.'
  },
  MODERATE: {
    id: 'modere',
    label: 'modéré',
    colorHex: '#D48806',
    bgLight: '#FEF8E7',
    bgDark: '#3D2802',
    borderLight: '#F5D78E',
    borderDark: '#6E4804',
    symbolShape: '△',
    severityTier: 3,
    description: 'Ruissellements marqués, submersion ponctuelle des voies secondaires.'
  },
  HIGH: {
    id: 'eleve',
    label: 'élevé',
    colorHex: '#C45517',
    bgLight: '#FDF1E9',
    bgDark: '#421C07',
    borderLight: '#F5BFA2',
    borderDark: '#75320C',
    symbolShape: '□',
    severityTier: 4,
    description: 'Inondation probable des concessions en points bas et coupures d\'axes.'
  },
  VERY_HIGH: {
    id: 'tres-eleve',
    label: 'très élevé',
    colorHex: '#A82222',
    bgLight: '#FDECEC',
    bgDark: '#470D0D',
    borderLight: '#F5ABAB',
    borderDark: '#7B1818',
    symbolShape: '🛑',
    severityTier: 5,
    description: 'Submersion critique imminente sous 48h menaçant habitations et daaras.'
  }
};

export const COMMUNES_DATA = {
  'touba-mosquee': {
    id: 'touba-mosquee',
    name: 'Touba Mosquée',
    region: 'Diourbel',
    department: 'Mbacké',
    overallRisk: 'très élevé',
    leadTime: '48 heures',
    modelConfidencePercent: 91,
    lastUpdateIso: '2026-09-20T07:15:00Z',
    lastUpdateLabel: '07:15 UTC (il y a 1 h 45 min)',
    weatherDataSource: 'GPM IMERG (NASA) + ECMWF IFS 0.1° + Radar local DMN',
    sensorFreshnessHours: 1.75,
    suggestedDecision: {
      action: 'Déclencher l\'alerte préventive niveau ALERTE',
      targetZones: ['Gouye Mbind', 'Darou Marnane'],
      targetCount: 3840,
      deadlineText: 'avant 11h30 (échéance pic d\'intensité à H+38h)',
      rationale: 'Le croisement du modèle topographique et de la pluie prévue (78 mm) indique une saturation critique des cuvettes sans exutoire.'
    },
    zones: [
      {
        id: 'gouye-mbind',
        name: 'Gouye Mbind',
        riskLevel: 'très élevé',
        riskScore: 93,
        confidence: 92,
        population: 2180,
        lastAlertLabel: 'Il y a 12 jours',
        rainfallForecastMm: 78,
        topographyProfile: 'Cuvette majeure fermée sans exutoire gravitaire',
        criticalSites: 'Marché central, Daara Cheikh Ibra, Poste BT',
        leadTimeHours: 38,
        svgCoords: {
          path: 'M 215,160 L 315,140 L 340,215 L 270,265 L 205,220 Z',
          cx: 268,
          cy: 200,
          labelPos: { x: 268, y: 195 }
        },
        timeProgression: {
          h0: { score: 18, level: 'très faible', rainMm: 0 },
          h12: { score: 36, level: 'faible', rainMm: 12 },
          h24: { score: 68, level: 'modéré', rainMm: 38 },
          h36: { score: 87, level: 'élevé', rainMm: 62 },
          h48: { score: 93, level: 'très élevé', rainMm: 78 }
        }
      },
      {
        id: 'darou-marnane',
        name: 'Darou Marnane',
        riskLevel: 'élevé',
        riskScore: 82,
        confidence: 87,
        population: 1660,
        lastAlertLabel: 'Il y a 5 jours',
        rainfallForecastMm: 64,
        topographyProfile: 'Pente d\'écoulement convergent vers voirie primaire',
        criticalSites: 'Poste de santé Darou Marnane, École 2',
        leadTimeHours: 42,
        svgCoords: {
          path: 'M 315,140 L 420,120 L 440,205 L 340,215 Z',
          cx: 375,
          cy: 170,
          labelPos: { x: 375, y: 165 }
        },
        timeProgression: {
          h0: { score: 14, level: 'très faible', rainMm: 0 },
          h12: { score: 29, level: 'faible', rainMm: 9 },
          h24: { score: 53, level: 'modéré', rainMm: 28 },
          h36: { score: 74, level: 'élevé', rainMm: 49 },
          h48: { score: 82, level: 'élevé', rainMm: 64 }
        }
      },
      {
        id: 'guede-bousso',
        name: 'Guédé Bousso',
        riskLevel: 'élevé',
        riskScore: 76,
        confidence: 84,
        population: 1340,
        lastAlertLabel: 'Il y a 18 jours',
        rainfallForecastMm: 58,
        topographyProfile: 'Bas-fond sablo-argileux avec saturation rapide',
        criticalSites: 'Axe Rocade Ouest, Station d\'épuration ONAS',
        leadTimeHours: 44,
        svgCoords: {
          path: 'M 125,190 L 215,160 L 205,220 L 140,285 Z',
          cx: 170,
          cy: 215,
          labelPos: { x: 170, y: 210 }
        },
        timeProgression: {
          h0: { score: 11, level: 'très faible', rainMm: 0 },
          h12: { score: 24, level: 'faible', rainMm: 8 },
          h24: { score: 47, level: 'faible', rainMm: 22 },
          h36: { score: 66, level: 'modéré', rainMm: 41 },
          h48: { score: 76, level: 'élevé', rainMm: 58 }
        }
      },
      {
        id: 'dianatoul-mahwa',
        name: 'Dianatoul Mahwa',
        riskLevel: 'modéré',
        riskScore: 54,
        confidence: 79,
        population: 980,
        lastAlertLabel: 'Il y a 24 jours',
        rainfallForecastMm: 41,
        topographyProfile: 'Replats à faible déclivité et sol compacté',
        criticalSites: 'Bassin de rétention n°3, Dispensaire',
        leadTimeHours: 46,
        svgCoords: {
          path: 'M 270,265 L 340,215 L 395,295 L 310,335 Z',
          cx: 330,
          cy: 280,
          labelPos: { x: 330, y: 275 }
        },
        timeProgression: {
          h0: { score: 8, level: 'très faible', rainMm: 0 },
          h12: { score: 19, level: 'faible', rainMm: 6 },
          h24: { score: 35, level: 'faible', rainMm: 17 },
          h36: { score: 48, level: 'modéré', rainMm: 31 },
          h48: { score: 54, level: 'modéré', rainMm: 41 }
        }
      },
      {
        id: 'sam-pathe',
        name: 'Sam Pathé',
        riskLevel: 'modéré',
        riskScore: 49,
        confidence: 81,
        population: 740,
        lastAlertLabel: 'Il y a 30 jours',
        rainfallForecastMm: 37,
        topographyProfile: 'Bordure méridionale de bassin versant',
        criticalSites: 'École franco-arabe, Forage n°2',
        leadTimeHours: 48,
        svgCoords: {
          path: 'M 140,285 L 205,220 L 270,265 L 310,335 L 225,365 Z',
          cx: 230,
          cy: 295,
          labelPos: { x: 230, y: 290 }
        },
        timeProgression: {
          h0: { score: 6, level: 'très faible', rainMm: 0 },
          h12: { score: 16, level: 'faible', rainMm: 4 },
          h24: { score: 31, level: 'faible', rainMm: 15 },
          h36: { score: 42, level: 'modéré', rainMm: 27 },
          h48: { score: 49, level: 'modéré', rainMm: 37 }
        }
      },
      {
        id: 'touba-alieu',
        name: 'Touba Alieu',
        riskLevel: 'faible',
        riskScore: 28,
        confidence: 88,
        population: 610,
        lastAlertLabel: 'Aucune cette saison',
        rainfallForecastMm: 22,
        topographyProfile: 'Zone surélevée sablonneuse avec drainage naturel',
        criticalSites: 'Pylône télécoms, Pharmacie Alieu',
        leadTimeHours: 48,
        svgCoords: {
          path: 'M 175,85 L 285,70 L 315,140 L 215,160 Z',
          cx: 245,
          cy: 115,
          labelPos: { x: 245, y: 110 }
        },
        timeProgression: {
          h0: { score: 4, level: 'très faible', rainMm: 0 },
          h12: { score: 10, level: 'très faible', rainMm: 3 },
          h24: { score: 18, level: 'très faible', rainMm: 8 },
          h36: { score: 23, level: 'faible', rainMm: 16 },
          h48: { score: 28, level: 'faible', rainMm: 22 }
        }
      },
      {
        id: 'hlm-touba',
        name: 'HLM Touba',
        riskLevel: 'très faible',
        riskScore: 14,
        confidence: 94,
        population: 490,
        lastAlertLabel: 'Aucune cette saison',
        rainfallForecastMm: 11,
        topographyProfile: 'Plateau sableux aménagé avec réseau de caniveaux bétonnés',
        criticalSites: 'Bureaux administratifs délégués',
        leadTimeHours: 48,
        svgCoords: {
          path: 'M 285,70 L 395,55 L 420,120 L 315,140 Z',
          cx: 350,
          cy: 98,
          labelPos: { x: 350, y: 95 }
        },
        timeProgression: {
          h0: { score: 2, level: 'très faible', rainMm: 0 },
          h12: { score: 5, level: 'très faible', rainMm: 2 },
          h24: { score: 8, level: 'très faible', rainMm: 4 },
          h36: { score: 11, level: 'très faible', rainMm: 7 },
          h48: { score: 14, level: 'très faible', rainMm: 11 }
        }
      }
    ]
  },

  'mbacke-commune': {
    id: 'mbacke-commune',
    name: 'Mbacké',
    region: 'Diourbel',
    department: 'Mbacké',
    overallRisk: 'modéré',
    leadTime: '48 heures',
    modelConfidencePercent: 86,
    lastUpdateIso: '2026-09-20T05:40:00Z',
    lastUpdateLabel: '05:40 UTC (il y a 3 h 20 min)',
    weatherDataSource: 'ECMWF IFS 0.1° + Station synoptique Diourbel',
    sensorFreshnessHours: 3.33,
    suggestedDecision: {
      action: 'Maintien en surveillance active (VIGILANCE)',
      targetZones: ['Gawane Escale'],
      targetCount: 1820,
      deadlineText: 'prochaine évaluation hydrologique à 12h00',
      rationale: 'Précipitations modérées (32 mm) sans risque immédiat de débordement du canal principal.'
    },
    zones: [
      {
        id: 'gawane-escale',
        name: 'Gawane Escale',
        riskLevel: 'modéré',
        riskScore: 59,
        confidence: 85,
        population: 1820,
        lastAlertLabel: 'Il y a 9 jours',
        rainfallForecastMm: 34,
        topographyProfile: 'Bordure aval du canal collecteur principal',
        criticalSites: 'Gare routière, Centre commercial',
        leadTimeHours: 48,
        svgCoords: {
          path: 'M 190,140 L 320,120 L 340,210 L 210,230 Z',
          cx: 265,
          cy: 175,
          labelPos: { x: 265, y: 170 }
        },
        timeProgression: {
          h0: { score: 9, level: 'très faible', rainMm: 0 },
          h12: { score: 22, level: 'faible', rainMm: 5 },
          h24: { score: 41, level: 'faible', rainMm: 16 },
          h36: { score: 51, level: 'modéré', rainMm: 26 },
          h48: { score: 59, level: 'modéré', rainMm: 34 }
        }
      },
      {
        id: 'ndoyenne',
        name: 'Ndoyenne',
        riskLevel: 'faible',
        riskScore: 33,
        confidence: 88,
        population: 1450,
        lastAlertLabel: 'Il y a 21 jours',
        rainfallForecastMm: 26,
        topographyProfile: 'Pente douce sablonneuse drainée',
        criticalSites: 'Poste de santé Ndoyenne',
        leadTimeHours: 48,
        svgCoords: {
          path: 'M 320,120 L 420,110 L 435,190 L 340,210 Z',
          cx: 380,
          cy: 160,
          labelPos: { x: 380, y: 155 }
        },
        timeProgression: {
          h0: { score: 5, level: 'très faible', rainMm: 0 },
          h12: { score: 14, level: 'très faible', rainMm: 4 },
          h24: { score: 22, level: 'faible', rainMm: 11 },
          h36: { score: 29, level: 'faible', rainMm: 19 },
          h48: { score: 33, level: 'faible', rainMm: 26 }
        }
      },
      {
        id: 'medina-mbacke',
        name: 'Médina Mbacké',
        riskLevel: 'faible',
        riskScore: 24,
        confidence: 89,
        population: 1980,
        lastAlertLabel: 'Aucune cette saison',
        rainfallForecastMm: 19,
        topographyProfile: 'Cœur urbain dense avec réseaux d\'évacuation',
        criticalSites: 'Marché central de Mbacké, Sous-préfecture',
        leadTimeHours: 48,
        svgCoords: {
          path: 'M 190,240 L 330,225 L 345,310 L 205,325 Z',
          cx: 268,
          cy: 275,
          labelPos: { x: 268, y: 270 }
        },
        timeProgression: {
          h0: { score: 4, level: 'très faible', rainMm: 0 },
          h12: { score: 9, level: 'très faible', rainMm: 3 },
          h24: { score: 16, level: 'très faible', rainMm: 8 },
          h36: { score: 21, level: 'faible', rainMm: 14 },
          h48: { score: 24, level: 'faible', rainMm: 19 }
        }
      }
    ]
  }
};

/**
 * Journal des alertes passées (10 alertes horodatées)
 * Inclut la fausse alerte documentée du 14 août et la chute d'engagement constatée au 18 août.
 */
export const PAST_ALERTS = [
  {
    id: 'ALT-2026-010',
    date: '18/08/2026',
    time: '15:12',
    timestamp: 1787065920000,
    commune: 'Touba Mosquée',
    zones: ['Gouye Mbind', 'Darou Marnane'],
    level: 'vigilance',
    recipientCount: 3840,
    triggerAgent: 'Lamine Seck (Agent communal hydrologie)',
    agentId: 'AGT-TB-408',
    openRatePercent: 61,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Baisse marquée de l\'ouverture consécutive à la fausse alerte du 14/08. Rétablissement de la confiance en cours.'
  },
  {
    id: 'ALT-2026-009',
    date: '14/08/2026',
    time: '18:30',
    timestamp: 1786732200000,
    commune: 'Touba Mosquée',
    zones: ['Darou Marnane'],
    level: 'alerte',
    recipientCount: 1660,
    triggerAgent: 'Abdoulaye Fall (Permanence territoriale)',
    agentId: 'AGT-TB-215',
    openRatePercent: 94,
    status: 'Livré — Incident documenté',
    falseAlert: true,
    postAnalysisNote: 'Fausse alerte documentée : orage convectif de 65 mm modélisé ayant subitement dévié à 12 km au sud. Aucun débordement constaté. Effet d\'usure (cry wolf) mesuré sur l\'alerte suivante.'
  },
  {
    id: 'ALT-2026-008',
    date: '08/08/2026',
    time: '06:45',
    timestamp: 1786169100000,
    commune: 'Touba Mosquée',
    zones: ['Gouye Mbind', 'Guédé Bousso'],
    level: 'alerte',
    recipientCount: 3520,
    triggerAgent: 'Lamine Seck (Agent communal hydrologie)',
    agentId: 'AGT-TB-408',
    openRatePercent: 96,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Alerte confirmée : 71 mm mesurés en 3h, évacuations préventives réussies à Gouye Mbind sans victime.'
  },
  {
    id: 'ALT-2026-007',
    date: '02/08/2026',
    time: '14:20',
    timestamp: 1785675600000,
    commune: 'Touba Mosquée',
    zones: ['Gouye Mbind'],
    level: 'vigilance',
    recipientCount: 2180,
    triggerAgent: 'Fatou Ndiaye (Coordination protection civile)',
    agentId: 'AGT-TB-102',
    openRatePercent: 91,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Surveillance préventive d\'une onde d\'est modérée.'
  },
  {
    id: 'ALT-2026-006',
    date: '27/07/2026',
    time: '21:10',
    timestamp: 1785183000000,
    commune: 'Touba Mosquée',
    zones: ['Sam Pathé'],
    level: 'vigilance',
    recipientCount: 740,
    triggerAgent: 'Abdoulaye Fall (Permanence territoriale)',
    agentId: 'AGT-TB-215',
    openRatePercent: 89,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Alerte nocturne sur montée progressive du bassin sud.'
  },
  {
    id: 'ALT-2026-005',
    date: '21/07/2026',
    time: '08:00',
    timestamp: 1784617200000,
    commune: 'Touba Mosquée',
    zones: ['Darou Marnane', 'Guédé Bousso'],
    level: 'alerte',
    recipientCount: 3000,
    triggerAgent: 'Lamine Seck (Agent communal hydrologie)',
    agentId: 'AGT-TB-408',
    openRatePercent: 93,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Événement pluvieux sévère (60 mm). Fermeture de la voirie d\'accès anticipée.'
  },
  {
    id: 'ALT-2026-004',
    date: '15/07/2026',
    time: '16:30',
    timestamp: 1784125800000,
    commune: 'Touba Mosquée',
    zones: ['Dianatoul Mahwa'],
    level: 'vigilance',
    recipientCount: 980,
    triggerAgent: 'Fatou Ndiaye (Coordination protection civile)',
    agentId: 'AGT-TB-102',
    openRatePercent: 88,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Dysfonctionnement temporaire de motopompe ONAS signalé aux riverains.'
  },
  {
    id: 'ALT-2026-003',
    date: '09/07/2026',
    time: '05:50',
    timestamp: 1783569000000,
    commune: 'Touba Mosquée',
    zones: ['Gouye Mbind'],
    level: 'alerte',
    recipientCount: 2180,
    triggerAgent: 'Lamine Seck (Agent communal hydrologie)',
    agentId: 'AGT-TB-408',
    openRatePercent: 95,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Premier gros orage précoce de saison (54 mm). Message wolof très relayé dans les daaras.'
  },
  {
    id: 'ALT-2026-002',
    date: '03/07/2026',
    time: '19:15',
    timestamp: 1783098900000,
    commune: 'Touba Mosquée',
    zones: ['Darou Marnane'],
    level: 'vigilance',
    recipientCount: 1660,
    triggerAgent: 'Abdoulaye Fall (Permanence territoriale)',
    agentId: 'AGT-TB-215',
    openRatePercent: 92,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Alerte orageuse pré-hivernage.'
  },
  {
    id: 'ALT-2026-001',
    date: '28/06/2026',
    time: '11:40',
    timestamp: 1782556800000,
    commune: 'Touba Mosquée',
    zones: ['Guédé Bousso'],
    level: 'vigilance',
    recipientCount: 1340,
    triggerAgent: 'Fatou Ndiaye (Coordination protection civile)',
    agentId: 'AGT-TB-102',
    openRatePercent: 90,
    status: 'Livré',
    falseAlert: false,
    postAnalysisNote: 'Test grandeur nature d\'activation des relais de quartier et chef de concessions.'
  }
];

export const AUDIO_MESSAGE_PREVIEWS = {
  vigilance: {
    title: 'Message de Vigilance Préventive (Échéance 48h)',
    frenchText: 'Commune de Touba Mosquée — Vigilance inondation : de fortes pluies sont prévues d\'ici 48 heures sur votre quartier. Nous recommandons de nettoyer les devantures, surélever les réserves de céréales et veiller aux déplacements des personnes âgées et enfants. Tenez-vous informés.',
    wolofText: 'Yeen waa Touba Mosquée, màngal ak ndox mu bari mën na am ci ñaari fan yii ci seen gox. Waawaaw, jëfi kaaraange yi : fàtteel seen kër, yëgleen seen dëpp ak seen yàpp ci kaw, te wattseen xale yi. Artu léen ci mbir mi.',
    wolofDisclaimer: '[Texte en wolof — à faire relire par un locuteur wolof]',
    durationSeconds: 34,
    audioToneType: 'informative'
  },
  alerte: {
    title: 'Message d\'Alerte Imminente (Échéance 48h)',
    frenchText: 'Commune de Touba Mosquée — Alerte inondation prioritaire : les prévisions météo et satellite indiquent un risque critique de montée des eaux dans les prochaines 48 heures sur votre zone. Recommandations impératives : surélevez immédiatement vos biens, protégez vos documents et coupez l\'électricité si l\'eau pénètre dans les cours. Évacuez les daaras vers les points hauts désignés.',
    wolofText: 'Yeen waa Gouye Mbind ak Darou Marnane, ndox mu bari dafa wara màcc ci ñaari fan yii ci Touba. Jëfi kaaraange yi gën a gaaw : yëgleen seeni mbir ci kaw, buleen bàyyi xale yi génn, bu ndox mi tàbbee ci kër yi gëddleen kuraŋ bi. Bu leen sàggan.',
    wolofDisclaimer: '[Texte en wolof — à faire relire par un locuteur wolof]',
    durationSeconds: 42,
    audioToneType: 'warning'
  }
};
