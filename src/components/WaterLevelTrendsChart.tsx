import React, { useState } from 'react';
import { 
  Waves, 
  CloudRain, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Info, 
  Layers, 
  Eye, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { CommuneData } from '../types.ts';

interface WaterLevelTrendsChartProps {
  commune: CommuneData;
  isDarkMode: boolean;
  onGoToMapZone?: (zoneId: string) => void;
}

// Données hydro-météorologiques modélisées à haute résolution (pas de 6h + point de pic à H+38h)
export interface HydrologyDataPoint {
  timeLabel: string;
  hours: number;
  dateTime: string;
  // Hauteurs d'eau estimées dans les points bas (en cm)
  gouyeMbind: number;
  darouMarnane: number;
  guedeBousso: number;
  dianatoulMahwa: number;
  // Pluviométrie
  rainMm: number;        // Intensité sur le créneau (mm)
  rainCumulMm: number;   // Pluie cumulée (mm)
  // Statut
  isPeak?: boolean;
}

const FORECAST_TRENDS: HydrologyDataPoint[] = [
  {
    timeLabel: 'H+0',
    hours: 0,
    dateTime: 'Aujourd\'hui 07h',
    gouyeMbind: 8,
    darouMarnane: 6,
    guedeBousso: 5,
    dianatoulMahwa: 4,
    rainMm: 0,
    rainCumulMm: 0
  },
  {
    timeLabel: 'H+6',
    hours: 6,
    dateTime: 'Aujourd\'hui 13h',
    gouyeMbind: 14,
    darouMarnane: 10,
    guedeBousso: 9,
    dianatoulMahwa: 7,
    rainMm: 6,
    rainCumulMm: 6
  },
  {
    timeLabel: 'H+12',
    hours: 12,
    dateTime: 'Aujourd\'hui 19h',
    gouyeMbind: 24,
    darouMarnane: 18,
    guedeBousso: 15,
    dianatoulMahwa: 12,
    rainMm: 12,
    rainCumulMm: 18
  },
  {
    timeLabel: 'H+18',
    hours: 18,
    dateTime: 'Demain 01h',
    gouyeMbind: 36, // Dépassement seuil de vigilance (35cm)
    darouMarnane: 27,
    guedeBousso: 22,
    dianatoulMahwa: 18,
    rainMm: 13,
    rainCumulMm: 31
  },
  {
    timeLabel: 'H+24',
    hours: 24,
    dateTime: 'Demain 07h',
    gouyeMbind: 49,
    darouMarnane: 37, // Dépassement vigilance
    guedeBousso: 30,
    dianatoulMahwa: 24,
    rainMm: 15,
    rainCumulMm: 46
  },
  {
    timeLabel: 'H+30',
    hours: 30,
    dateTime: 'Demain 13h',
    gouyeMbind: 62, // Dépassement cote critique de débordement (60cm)
    darouMarnane: 44,
    guedeBousso: 37,
    dianatoulMahwa: 29,
    rainMm: 12,
    rainCumulMm: 58
  },
  {
    timeLabel: 'H+36',
    hours: 36,
    dateTime: 'Demain 19h',
    gouyeMbind: 71,
    darouMarnane: 49,
    guedeBousso: 42,
    dianatoulMahwa: 34,
    rainMm: 12,
    rainCumulMm: 70
  },
  {
    timeLabel: 'H+38 (Pic)',
    hours: 38,
    dateTime: 'Demain 21h',
    gouyeMbind: 74, // PIC CRITIQUE MAXIMAL
    darouMarnane: 52,
    guedeBousso: 44,
    dianatoulMahwa: 35,
    rainMm: 4,
    rainCumulMm: 74,
    isPeak: true
  },
  {
    timeLabel: 'H+42',
    hours: 42,
    dateTime: 'J+2 01h',
    gouyeMbind: 72,
    darouMarnane: 51,
    guedeBousso: 43,
    dianatoulMahwa: 33,
    rainMm: 2,
    rainCumulMm: 76
  },
  {
    timeLabel: 'H+48',
    hours: 48,
    dateTime: 'J+2 07h',
    gouyeMbind: 68,
    darouMarnane: 47,
    guedeBousso: 40,
    dianatoulMahwa: 30,
    rainMm: 2,
    rainCumulMm: 78
  }
];

export const WaterLevelTrendsChart: React.FC<WaterLevelTrendsChartProps> = ({
  commune,
  isDarkMode,
  onGoToMapZone
}) => {
  // Mode de visualisation : zone spécifique ou comparaison multi-zones
  const [selectedZoneMode, setSelectedZoneMode] = useState<'gouyeMbind' | 'darouMarnane' | 'guedeBousso' | 'comparison'>('gouyeMbind');
  const [showRainfall, setShowRainfall] = useState<boolean>(true);

  // Configuration des seuils hydrologiques critiques
  const THRESHOLD_VIGILANCE = 35; // cm : début de débordement des caniveaux et chaussées
  const THRESHOLD_CRITICAL = 60;  // cm : submersion des concessions, cours et postes électriques

  // Zone metadata
  const zoneMeta = {
    gouyeMbind: {
      name: 'Gouye Mbind',
      id: 'gouye-mbind',
      color: '#A82222', // Rouge très élevé
      profile: 'Cuvette majeure fermée sans exutoire',
      peakLevel: 74,
      peakHour: 'H+38h (demain 21h)',
      criticalTime: 'Dans 22h (dès H+29h)',
      risk: 'très élevé'
    },
    darouMarnane: {
      name: 'Darou Marnane',
      id: 'darou-marnane',
      color: '#C45517', // Orange foncé élevé
      profile: 'Pente d\'écoulement convergent vers voirie',
      peakLevel: 52,
      peakHour: 'H+40h (demain 23h)',
      criticalTime: 'Vigilance à H+23h',
      risk: 'élevé'
    },
    guedeBousso: {
      name: 'Guédé Bousso',
      id: 'guede-bousso',
      color: '#D48806', // Ocre modéré/élevé
      profile: 'Bas-fond sablo-argileux à saturation rapide',
      peakLevel: 44,
      peakHour: 'H+38h (demain 21h)',
      criticalTime: 'Vigilance à H+28h',
      risk: 'élevé'
    }
  };

  const activeZoneInfo = selectedZoneMode !== 'comparison' ? zoneMeta[selectedZoneMode] : zoneMeta.gouyeMbind;

  // Custom Tooltip pour Recharts adapté aux exigences opérationnelles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: HydrologyDataPoint = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className={`p-3 rounded-lg border shadow-xl text-xs max-w-xs transition-all z-50 ${
        isDarkMode 
          ? 'bg-[#0B2C40] border-[#174A66] text-white shadow-black/60' 
          : 'bg-white border-[#A3D4DC] text-[#10344A] shadow-gray-400/30'
      }`}>
        <div className="flex items-center justify-between border-b pb-1.5 mb-2 border-black/10 dark:border-white/10">
          <span className="font-bold font-mono text-sm text-[#10344A] dark:text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1B5E8C] dark:text-[#9EC0D4]" />
            {data.timeLabel}
          </span>
          <span className="text-[11px] text-[#3A6076] dark:text-[#9EC0D4]">
            {data.dateTime}
          </span>
        </div>

        <div className="space-y-1.5">
          {selectedZoneMode === 'comparison' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A82222]" />
                  <span>Gouye Mbind :</span>
                </span>
                <span className="font-mono font-bold text-[#A82222]">{data.gouyeMbind} cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C45517]" />
                  <span>Darou Marnane :</span>
                </span>
                <span className="font-mono font-bold text-[#C45517]">{data.darouMarnane} cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D48806]" />
                  <span>Guédé Bousso :</span>
                </span>
                <span className="font-mono font-bold text-[#D48806]">{data.guedeBousso} cm</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[#3A6076] dark:text-[#9EC0D4]">Niveau d'eau estimé :</span>
              <span className={`font-mono text-sm font-bold ${
                data[selectedZoneMode] >= THRESHOLD_CRITICAL 
                  ? 'text-[#A82222]' 
                  : data[selectedZoneMode] >= THRESHOLD_VIGILANCE 
                    ? 'text-[#D48806]' 
                    : 'text-[#1B5E8C] dark:text-[#56A5D8]'
              }`}>
                {data[selectedZoneMode]} cm
              </span>
            </div>
          )}

          {/* Diagnostic de submersion par rapport aux seuils */}
          {selectedZoneMode !== 'comparison' && (
            <div className="pt-1 border-t border-black/5 dark:border-white/5 text-[11px]">
              {data[selectedZoneMode] >= THRESHOLD_CRITICAL ? (
                <span className="inline-flex items-center gap-1 text-[#A82222] font-semibold">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Seuil critique dépassé (+{data[selectedZoneMode] - THRESHOLD_CRITICAL} cm)
                </span>
              ) : data[selectedZoneMode] >= THRESHOLD_VIGILANCE ? (
                <span className="inline-flex items-center gap-1 text-[#D48806] font-semibold">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Cote de vigilance atteinte
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#2E9E78]">
                  <CheckCircle className="w-3 h-3 shrink-0" />
                  Écoulement et cuvette stables
                </span>
              )}
            </div>
          )}

          {showRainfall && (
            <div className="pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-[#3A6076] dark:text-[#9EC0D4] flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-[#1B5E8C] dark:text-[#9EC0D4]" />
                Pluie cumulée :
              </span>
              <span className="font-mono font-semibold text-[#1B5E8C] dark:text-[#9EC0D4]">
                {data.rainCumulMm} mm
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section 
      id="water-level-trends-section"
      className={`rounded-xl border shadow-sm transition-all overflow-hidden ${
        isDarkMode
          ? 'bg-[#0B2C40] border-[#174A66] text-white'
          : 'bg-white border-[#A3D4DC] text-[#10344A]'
      }`}
      aria-label="Tendances et projections des niveaux d'eau à 48 heures"
    >
      {/* En-tête avec titre, contexte et sélecteurs de zones */}
      <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#1B5E8C] text-white font-mono">
              <Waves className="w-3.5 h-3.5" />
              Hydrologie 48h
            </span>
            <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
              Modèle couplé MNT + Radar GPM + ECMWF
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#10344A] dark:text-white flex items-center gap-2">
            <span>Projection des niveaux d'eau en cuvettes & points bas</span>
          </h3>
          <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
            Suivi prévisionnel de submersion de 0 h à 48 h pour anticiper les coupures d'axes et l'inondation des habitations.
          </p>
        </div>

        {/* Contrôles interactifs : sélecteur de zone & toggle pluie */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur de zone */}
          <div className="inline-flex rounded-lg p-1 bg-black/5 dark:bg-[#083048] border border-black/10 dark:border-[#174A66] text-xs">
            <button
              type="button"
              onClick={() => setSelectedZoneMode('gouyeMbind')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                selectedZoneMode === 'gouyeMbind'
                  ? 'bg-[#A82222] text-white font-bold shadow-xs'
                  : 'text-[#3A6076] dark:text-[#9EC0D4] hover:text-[#10344A] dark:hover:text-white'
              }`}
            >
              Gouye Mbind
            </button>
            <button
              type="button"
              onClick={() => setSelectedZoneMode('darouMarnane')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                selectedZoneMode === 'darouMarnane'
                  ? 'bg-[#C45517] text-white font-bold shadow-xs'
                  : 'text-[#3A6076] dark:text-[#9EC0D4] hover:text-[#10344A] dark:hover:text-white'
              }`}
            >
              Darou Marnane
            </button>
            <button
              type="button"
              onClick={() => setSelectedZoneMode('guedeBousso')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                selectedZoneMode === 'guedeBousso'
                  ? 'bg-[#D48806] text-white font-bold shadow-xs'
                  : 'text-[#3A6076] dark:text-[#9EC0D4] hover:text-[#10344A] dark:hover:text-white'
              }`}
            >
              Guédé Bousso
            </button>
            <button
              type="button"
              onClick={() => setSelectedZoneMode('comparison')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                selectedZoneMode === 'comparison'
                  ? 'bg-[#1B5E8C] text-white font-bold shadow-xs'
                  : 'text-[#3A6076] dark:text-[#9EC0D4] hover:text-[#10344A] dark:hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Multi-zones</span>
            </button>
          </div>

          {/* Toggle pluie cumulée */}
          <button
            type="button"
            onClick={() => setShowRainfall(!showRainfall)}
            className={`min-h-[34px] px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showRainfall
                ? 'bg-[#1B5E8C]/15 dark:bg-[#1B5E8C]/30 border-[#1B5E8C] text-[#1B5E8C] dark:text-[#56A5D8] font-semibold'
                : 'bg-transparent border-black/10 dark:border-white/10 text-[#3A6076] dark:text-[#9EC0D4]'
            }`}
            title="Activer ou masquer l'axe pluviométrique cumulé"
            aria-pressed={showRainfall}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Pluie cumulée</span>
          </button>
        </div>
      </div>

      {/* Cartes métriques opérationnelles immédiates (Aide à la décision en 10 secondes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 p-4 sm:p-5 bg-black/[0.02] dark:bg-black/20 border-b border-black/10 dark:border-white/10 text-xs">
        {/* Métrique 1 : Pic d'eau maximal */}
        <div className="p-3 rounded-lg bg-white dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66]">
          <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block font-medium">
            Pic de crue estimé
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#A82222]">
              {selectedZoneMode === 'comparison' ? '74 cm' : `${activeZoneInfo.peakLevel} cm`}
            </span>
            <span className="text-[10px] text-[#A82222] font-semibold">
              (+14 cm / seuil crit.)
            </span>
          </div>
          <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block mt-0.5">
            Échéance pic : {activeZoneInfo.peakHour}
          </span>
        </div>

        {/* Métrique 2 : Délais avant submersion critique */}
        <div className="p-3 rounded-lg bg-white dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66]">
          <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block font-medium">
            Franchissement cote 60 cm
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#10344A] dark:text-white">
              H+29h
            </span>
            <span className="text-[10px] text-[#C45517] font-semibold">
              Demain ~12h
            </span>
          </div>
          <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block mt-0.5">
            Fenêtre d'alerte : &lt; 12 heures restantes
          </span>
        </div>

        {/* Métrique 3 : Pluie cumulée max */}
        <div className="p-3 rounded-lg bg-white dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66]">
          <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block font-medium">
            Précipitations totales 48h
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#1B5E8C] dark:text-[#56A5D8]">
              78 mm
            </span>
            <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4]">
              (orage centennal)
            </span>
          </div>
          <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block mt-0.5">
            Intensité max : 15 mm/h à H+24h
          </span>
        </div>

        {/* Métrique 4 : Saturation du sol */}
        <div className="p-3 rounded-lg bg-white dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66]">
          <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block font-medium">
            Saturation des cuvettes
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#C45517]">
              93 %
            </span>
            <span className="text-[10px] text-[#A82222] font-semibold">
              Critique
            </span>
          </div>
          <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block mt-0.5">
            Infiltration nulle après 35 mm
          </span>
        </div>
      </div>

      {/* Graphique Recharts principal */}
      <div className="p-3 sm:p-5">
        <div className="h-72 sm:h-80 w-full" id="hydrology-recharts-container">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={FORECAST_TRENDS}
              margin={{ top: 15, right: showRainfall ? 25 : 15, left: -5, bottom: 5 }}
            >
              <defs>
                {/* Gradient pour l'aire de Gouye Mbind */}
                <linearGradient id="waterGradientGouye" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A82222" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#C45517" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1B5E8C" stopOpacity={0.05} />
                </linearGradient>

                {/* Gradient pour Darou Marnane */}
                <linearGradient id="waterGradientDarou" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C45517" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1B5E8C" stopOpacity={0.05} />
                </linearGradient>

                {/* Gradient pour Guédé Bousso */}
                <linearGradient id="waterGradientGuede" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D48806" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1B5E8C" stopOpacity={0.05} />
                </linearGradient>

                {/* Gradient pluie */}
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B5E8C" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#1B5E8C" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#174A66' : '#E2EDF3'} 
                vertical={false} 
              />

              {/* Axe X : Horizons temporels */}
              <XAxis 
                dataKey="timeLabel" 
                stroke={isDarkMode ? '#9EC0D4' : '#3A6076'} 
                tick={{ fontSize: 11, fill: isDarkMode ? '#9EC0D4' : '#3A6076' }}
                tickLine={false}
              />

              {/* Axe Y Gauche : Niveau d'eau en cm */}
              <YAxis 
                yAxisId="water"
                domain={[0, 90]} 
                stroke={isDarkMode ? '#9EC0D4' : '#3A6076'} 
                tick={{ fontSize: 11, fill: isDarkMode ? '#9EC0D4' : '#3A6076' }}
                tickFormatter={(value) => `${value} cm`}
                tickLine={false}
              />

              {/* Axe Y Droit optionnel : Pluie cumulée en mm */}
              {showRainfall && (
                <YAxis 
                  yAxisId="rain"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#1B5E8C" 
                  tick={{ fontSize: 10, fill: isDarkMode ? '#56A5D8' : '#1B5E8C' }}
                  tickFormatter={(value) => `${value} mm`}
                  tickLine={false}
                />
              )}

              <Tooltip content={<CustomTooltip />} />

              {/* SEUILS HYDROLOGIQUES CLÉS : Norme 3 signaux */}
              {/* 1. Cote critique de débordement (60 cm) */}
              <ReferenceLine 
                yAxisId="water"
                y={THRESHOLD_CRITICAL} 
                stroke="#A82222" 
                strokeDasharray="5 4" 
                strokeWidth={2}
                label={{ 
                  value: 'Cote d\'inondation critique (60 cm)', 
                  position: 'insideTopLeft',
                  fill: '#A82222',
                  fontSize: 10,
                  fontWeight: 700
                }} 
              />

              {/* 2. Cote de vigilance (35 cm) */}
              <ReferenceLine 
                yAxisId="water"
                y={THRESHOLD_VIGILANCE} 
                stroke="#D48806" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: 'Cote de vigilance caniveaux (35 cm)', 
                  position: 'insideTopLeft',
                  fill: '#D48806',
                  fontSize: 10,
                  fontWeight: 600
                }} 
              />

              {/* 3. Marqueur temporel du pic à H+38h */}
              <ReferenceLine 
                yAxisId="water"
                x="H+38 (Pic)" 
                stroke="#A82222" 
                strokeWidth={1.5}
                label={{ 
                  value: 'Pic H+38h', 
                  position: 'insideTopRight',
                  fill: '#A82222',
                  fontSize: 10,
                  fontWeight: 700
                }} 
              />

              {/* Affichage des barres de pluie sur axe droit */}
              {showRainfall && (
                <Bar 
                  yAxisId="rain"
                  dataKey="rainMm" 
                  name="Pluie horaire (mm)"
                  fill="url(#rainGradient)" 
                  stroke="#1B5E8C"
                  strokeOpacity={0.6}
                  radius={[3, 3, 0, 0]}
                  barSize={16}
                />
              )}

              {/* Mode mono-zone : Affichage avec remplissage dégradé sous la courbe */}
              {selectedZoneMode === 'gouyeMbind' && (
                <Area
                  yAxisId="water"
                  type="monotone"
                  dataKey="gouyeMbind"
                  name="Niveau d'eau Gouye Mbind (cm)"
                  stroke="#A82222"
                  strokeWidth={3}
                  fill="url(#waterGradientGouye)"
                  dot={{ r: 3, fill: '#A82222', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#A82222', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}

              {selectedZoneMode === 'darouMarnane' && (
                <Area
                  yAxisId="water"
                  type="monotone"
                  dataKey="darouMarnane"
                  name="Niveau d'eau Darou Marnane (cm)"
                  stroke="#C45517"
                  strokeWidth={3}
                  fill="url(#waterGradientDarou)"
                  dot={{ r: 3, fill: '#C45517', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#C45517', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}

              {selectedZoneMode === 'guedeBousso' && (
                <Area
                  yAxisId="water"
                  type="monotone"
                  dataKey="guedeBousso"
                  name="Niveau d'eau Guédé Bousso (cm)"
                  stroke="#D48806"
                  strokeWidth={3}
                  fill="url(#waterGradientGuede)"
                  dot={{ r: 3, fill: '#D48806', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#D48806', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}

              {/* Mode multi-zones : 3 courbes distinctes pour comparaison directe */}
              {selectedZoneMode === 'comparison' && (
                <>
                  <Line
                    yAxisId="water"
                    type="monotone"
                    dataKey="gouyeMbind"
                    name="Gouye Mbind (Cuvette fermée)"
                    stroke="#A82222"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#A82222' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="water"
                    type="monotone"
                    dataKey="darouMarnane"
                    name="Darou Marnane (Point bas)"
                    stroke="#C45517"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#C45517' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="water"
                    type="monotone"
                    dataKey="guedeBousso"
                    name="Guédé Bousso (Bas-fond)"
                    stroke="#D48806"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#D48806' }}
                    activeDot={{ r: 5 }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Légende opérationnelle et explication pour l'agent */}
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#3A6076] dark:text-[#9EC0D4]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-0.5 bg-[#A82222] inline-block border-b-2 border-dashed border-[#A82222]" />
              <span>Cote critique (60 cm)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-0.5 bg-[#D48806] inline-block border-b-2 border-dashed border-[#D48806]" />
              <span>Cote vigilance (35 cm)</span>
            </span>
            {showRainfall && (
              <span className="flex items-center gap-1.5 font-medium text-[#1B5E8C] dark:text-[#56A5D8]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1B5E8C]/50 inline-block" />
                <span>Pluie par créneau (mm)</span>
              </span>
            )}
          </div>

          {/* Lien direct pour inspecter sur la carte */}
          {onGoToMapZone && (
            <button
              type="button"
              onClick={() => onGoToMapZone(activeZoneInfo.id)}
              className="inline-flex items-center gap-1 font-bold text-[#1B5E8C] dark:text-[#F5C518] hover:underline cursor-pointer"
            >
              <span>Voir l'emprise sur la carte de Touba</span>
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
