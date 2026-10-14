import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  Send, 
  Clock, 
  Info, 
  MapPin, 
  CheckSquare, 
  Square,
  AlertCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { CommuneData, ZoneData } from '../types.ts';
import { RISK_LEVELS } from '../mockData.js';
import { RiskSignalBadge } from './RiskSignalBadge.tsx';

interface RiskMapViewProps {
  commune: CommuneData;
  initialSelectedZoneId?: string;
  onGoToTrigger: (selectedZoneIds: string[]) => void;
  isDarkMode: boolean;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  commune,
  initialSelectedZoneId,
  onGoToTrigger,
  isDarkMode
}) => {
  // Échéance temporelle sélectionnée : 0, 12, 24, 36, 48
  const [timeStep, setTimeStep] = useState<number>(48);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Zones sélectionnées pour l'alerte
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(() => {
    if (initialSelectedZoneId) {
      return [initialSelectedZoneId];
    }
    // Par défaut, sélectionner les zones à risque très élevé et élevé
    return commune.zones
      .filter(z => z.riskLevel === 'très élevé' || z.riskLevel === 'élevé')
      .map(z => z.id);
  });

  // Zone actuellement inspectée
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(initialSelectedZoneId || commune.zones[0]?.id || null);

  // Couches cartographiques activables
  const [layers, setLayers] = useState({
    susceptibility: true,
    rainfall: true,
    lowPoints: true,
    fieldReports: true
  });

  // Animation du curseur temporel
  React.useEffect(() => {
    let interval: number | null = null;
    if (isPlayingTimeline) {
      interval = window.setInterval(() => {
        setTimeStep((prev) => {
          if (prev >= 48) return 0;
          return prev + 12;
        });
      }, 1400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingTimeline]);

  const toggleZoneSelection = (zoneId: string) => {
    setSelectedZoneIds(prev => 
      prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
    );
  };

  // Obtenir les valeurs dynamiques de la zone selon le pas de temps
  const getZoneAtTime = (zone: ZoneData) => {
    const key = `h${timeStep}`;
    const dynamic = zone.timeProgression[key] || {
      score: zone.riskScore,
      level: zone.riskLevel,
      rainMm: zone.rainfallForecastMm
    };
    return dynamic;
  };

  // Convertir le niveau en couleur pour le SVG
  const getLevelColor = (levelStr: string) => {
    const normalized = levelStr.toLowerCase().trim();
    if (normalized === 'très élevé' || normalized === 'tres eleve') return RISK_LEVELS.VERY_HIGH.colorHex;
    if (normalized === 'élevé' || normalized === 'eleve') return RISK_LEVELS.HIGH.colorHex;
    if (normalized === 'modéré' || normalized === 'modere') return RISK_LEVELS.MODERATE.colorHex;
    if (normalized === 'faible') return RISK_LEVELS.LOW.colorHex;
    return RISK_LEVELS.VERY_LOW.colorHex;
  };

  // Zone active pour la fiche détaillée
  const activeZone = commune.zones.find(z => z.id === hoveredZoneId) || commune.zones[0];
  const activeZoneDynamic = getZoneAtTime(activeZone);

  // Total population sélectionnée
  const totalSelectedPopulation = commune.zones
    .filter(z => selectedZoneIds.includes(z.id))
    .reduce((sum, z) => sum + z.population, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Barre supérieure d'en-tête de la carte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B2C40] p-4 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B5E8C] text-white">
              Étape 2 : Simulation Spatiale & Temporelle
            </span>
            <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
              {commune.name}
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#10344A] dark:text-white mt-1">
            Carte de risque d'inondation à 48 heures
          </h2>
        </div>

        {/* Bouton passer à l'étape 3 : Préparer l'alerte */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="prepare-alert-cta"
            type="button"
            onClick={() => onGoToTrigger(selectedZoneIds)}
            disabled={selectedZoneIds.length === 0}
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-[#A82222] hover:bg-[#8F1A1A] disabled:bg-gray-400 text-white font-bold text-sm shadow-md transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#F5C518]"
            aria-label="Passer à l'étape de déclenchement de l'alerte pour les zones sélectionnées"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Préparer l'alerte ({selectedZoneIds.length} zone{selectedZoneIds.length > 1 ? 's' : ''} • {totalSelectedPopulation.toLocaleString('fr-FR')} hab.)</span>
          </button>
        </div>
      </div>

      {/* Grille principale : Carte interactive + Panneau de configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Colonne Carte & Curseur Temporel (8 colonnes sur grand écran, 12 sur mobile) */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          <div className="relative rounded-xl border border-[#A3D4DC] dark:border-[#174A66] bg-white dark:bg-[#083048] p-3 sm:p-4 shadow-xs overflow-hidden">
            {/* Légende rapide en surimpression */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-black/5 dark:border-white/10 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#10344A] dark:text-white">
                <Clock className="w-3.5 h-3.5 text-[#1B5E8C]" />
                <span>Simulation à H+{timeStep} heures</span>
              </div>
              <span className="text-[11px] text-[#3A6076] dark:text-[#9EC0D4]">
                Touchez une zone pour la cibler
              </span>
            </div>

            {/* Canevas SVG de la carte vectorielle */}
            <div className="relative w-full h-[300px] xs:h-[350px] sm:h-[440px] bg-[#E8F3FC]/40 dark:bg-[#061D2B] rounded-lg border border-[#A3D4DC]/60 dark:border-[#174A66] overflow-hidden flex items-center justify-center">
              <svg
                id="hydrological-risk-map"
                viewBox="80 30 400 360"
                className="w-full h-full drop-shadow-sm select-none"
                role="img"
                aria-label="Carte schématique vectorielle des zones inondables de Touba"
              >
                {/* Fond topographique schématique */}
                <defs>
                  <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isDarkMode ? '#13394D' : '#D1E6F5'} strokeWidth="0.5" />
                  </pattern>
                  <pattern id="hatch-susceptibility" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#0E3A50" strokeWidth="1.5" strokeOpacity="0.15" />
                  </pattern>
                </defs>

                {/* Grille de repérage */}
                <rect x="80" y="30" width="400" height="360" fill="url(#grid-pattern)" />

                {/* Courbes de niveau / Bassin versant Touba */}
                <path
                  d="M 100,200 C 180,120 300,100 440,150 C 470,220 380,360 250,370 C 150,380 90,290 100,200 Z"
                  fill="none"
                  stroke={isDarkMode ? '#1B475E' : '#B8DCF3'}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Réseau de voiries primaires et axes d'écoulement */}
                <g stroke={isDarkMode ? '#244D63' : '#CBDCE8'} strokeWidth="3" strokeLinecap="round">
                  <line x1="268" y1="50" x2="268" y2="380" strokeDasharray="6,4" />
                  <line x1="90" y1="210" x2="460" y2="210" strokeDasharray="6,4" />
                  <circle cx="268" cy="210" r="140" fill="none" strokeWidth="1.5" strokeDasharray="3,3" />
                </g>

                {/* Zones polygones interactives */}
                {commune.zones.map((zone) => {
                  const dynamicData = getZoneAtTime(zone);
                  const isSelected = selectedZoneIds.includes(zone.id);
                  const isHovered = hoveredZoneId === zone.id;
                  const fillColor = getLevelColor(dynamicData.level);

                  return (
                    <g
                      key={zone.id}
                      id={`svg-zone-${zone.id}`}
                      className="cursor-pointer transition-transform duration-200"
                      onClick={() => {
                        setHoveredZoneId(zone.id);
                        toggleZoneSelection(zone.id);
                      }}
                      onMouseEnter={() => setHoveredZoneId(zone.id)}
                    >
                      {/* Polygone de la zone */}
                      <path
                        d={zone.svgCoords.path}
                        fill={fillColor}
                        fillOpacity={isHovered ? 0.95 : isSelected ? 0.85 : 0.65}
                        stroke={isSelected ? '#F5C518' : isDarkMode ? '#FFFFFF' : '#083048'}
                        strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                        strokeLinejoin="round"
                        className="transition-colors duration-300"
                      />

                      {/* Couche Susceptibilité */}
                      {layers.susceptibility && (
                        <path
                          d={zone.svgCoords.path}
                          fill="url(#hatch-susceptibility)"
                          pointerEvents="none"
                        />
                      )}

                      {/* Étiquette texte au centre */}
                      <text
                        x={zone.svgCoords.labelPos.x}
                        y={zone.svgCoords.labelPos.y}
                        textAnchor="middle"
                        fill={isDarkMode ? '#FFFFFF' : '#0E3A50'}
                        fontSize="11"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-xs"
                      >
                        {zone.name}
                      </text>

                      {/* Score dynamique sous le label */}
                      <text
                        x={zone.svgCoords.labelPos.x}
                        y={zone.svgCoords.labelPos.y + 14}
                        textAnchor="middle"
                        fill={isDarkMode ? '#F5C518' : '#083048'}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {dynamicData.score} % ({dynamicData.rainMm} mm)
                      </text>
                    </g>
                  );
                })}

                {/* Repère Mosquée de Touba */}
                <g transform="translate(268, 210)">
                  <circle cx="0" cy="0" r="10" fill="#0E3A50" stroke="#F5C518" strokeWidth="2" />
                  <text x="0" y="3" textAnchor="middle" fill="#F5C518" fontSize="8" fontWeight="bold">M</text>
                  <text x="0" y="19" textAnchor="middle" fill={isDarkMode ? '#FFFFFF' : '#0E3A50'} fontSize="9" fontWeight="bold">
                    Grande Mosquée
                  </text>
                </g>
              </svg>

              {/* Badge indicatif sélection sur la carte */}
              <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#F5C518]" />
                <span>{selectedZoneIds.length} zone(s) sélectionnée(s)</span>
              </div>
            </div>

            {/* CURSEUR TEMPOREL 0H - 48H ADAPTÉ SMARTPHONE */}
            <div className="mt-3 p-3 rounded-lg bg-[#E8F3FC] dark:bg-[#0B2C40] border border-[#A3D4DC] dark:border-[#174A66] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="play-timeline-btn"
                    type="button"
                    onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#1B5E8C] hover:bg-[#0E3A50] text-white transition-colors cursor-pointer"
                    aria-label={isPlayingTimeline ? 'Mettre en pause' : 'Lancer l\'animation temporelle'}
                  >
                    {isPlayingTimeline ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    id="reset-timeline-btn"
                    type="button"
                    onClick={() => {
                      setIsPlayingTimeline(false);
                      setTimeStep(0);
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-[#10344A] dark:text-white hover:bg-black/10 transition-colors"
                    aria-label="Réinitialiser à 0h"
                    title="Réinitialiser à H+0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-[#10344A] dark:text-white">
                    Progression 0h → 48h
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-mono font-bold text-[#1B5E8C] dark:text-[#F5C518] bg-white dark:bg-[#083048] px-2 py-1 rounded border border-[#174A66]/30">
                  +{timeStep} h
                </div>
              </div>

              {/* Slider chronologique */}
              <div className="relative pt-1">
                <input
                  id="time-step-slider"
                  type="range"
                  min="0"
                  max="48"
                  step="12"
                  value={timeStep}
                  onChange={(e) => {
                    setIsPlayingTimeline(false);
                    setTimeStep(Number(e.target.value));
                  }}
                  className="w-full h-3 bg-white dark:bg-[#083048] rounded-lg appearance-none cursor-pointer accent-[#1B5E8C]"
                  aria-label="Curseur temporel d'évolution du risque hydrologique"
                />
                {/* Repères tactiles sous le slider */}
                <div className="grid grid-cols-5 gap-1 text-[10px] sm:text-xs font-mono text-[#3A6076] dark:text-[#9EC0D4] mt-1.5 text-center">
                  {[
                    { step: 0, label: '0 h', sub: 'Actuel' },
                    { step: 12, label: '+12 h', sub: '' },
                    { step: 24, label: '+24 h', sub: '' },
                    { step: 36, label: '+36 h', sub: 'Pluie' },
                    { step: 48, label: '+48 h', sub: 'Pic' },
                  ].map(item => (
                    <button
                      key={`step-btn-${item.step}`}
                      type="button"
                      onClick={() => setTimeStep(item.step)}
                      className={`min-h-[38px] py-1 px-0.5 rounded cursor-pointer transition-all ${
                        timeStep === item.step
                          ? 'bg-[#1B5E8C] text-white font-bold shadow-xs'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="leading-tight">{item.label}</div>
                      {item.sub && <div className="text-[9px] opacity-80">{item.sub}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau latéral : Couches activables & Fiche de la zone active */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">
          {/* Bloc 1 : Couches cartographiques activables */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] bg-white dark:bg-[#0B2C40] shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3A6076] dark:text-[#9EC0D4] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1B5E8C]" />
              <span>Couches d'analyse spatiale</span>
            </h3>

            <div className="space-y-1.5 text-sm">
              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded bg-[#E8F3FC] dark:bg-[#083048] cursor-pointer">
                <span className="text-xs font-medium text-[#10344A] dark:text-white">Susceptibilité satellite</span>
                <input
                  type="checkbox"
                  checked={layers.susceptibility}
                  onChange={(e) => setLayers({ ...layers, susceptibility: e.target.checked })}
                  className="w-4 h-4 accent-[#1B5E8C] cursor-pointer"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded bg-[#E8F3FC] dark:bg-[#083048] cursor-pointer">
                <span className="text-xs font-medium text-[#10344A] dark:text-white">Précipitations ECMWF</span>
                <input
                  type="checkbox"
                  checked={layers.rainfall}
                  onChange={(e) => setLayers({ ...layers, rainfall: e.target.checked })}
                  className="w-4 h-4 accent-[#1B5E8C] cursor-pointer"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded bg-[#E8F3FC] dark:bg-[#083048] cursor-pointer">
                <span className="text-xs font-medium text-[#10344A] dark:text-white">Points bas & Cuvettes</span>
                <input
                  type="checkbox"
                  checked={layers.lowPoints}
                  onChange={(e) => setLayers({ ...layers, lowPoints: e.target.checked })}
                  className="w-4 h-4 accent-[#1B5E8C] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Bloc 2 : Fiche détaillée de la zone active */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] bg-white dark:bg-[#0B2C40] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-black/5 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#3A6076] dark:text-[#9EC0D4]">
                  Fiche de zone inspectée
                </span>
                <h4 className="text-base font-bold text-[#10344A] dark:text-white mt-0.5">
                  {activeZone.name}
                </h4>
              </div>
              <RiskSignalBadge
                level={activeZoneDynamic.level}
                score={activeZoneDynamic.score}
                size="sm"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Caractéristiques géographiques */}
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#E8F3FC] dark:bg-[#083048]">
                <span className="text-[#3A6076] dark:text-[#9EC0D4] block text-[11px]">Topographie :</span>
                <span className="font-medium text-[#10344A] dark:text-white">
                  {activeZone.topographyProfile}
                </span>
              </div>

              <div className="p-2 rounded bg-[#E8F3FC] dark:bg-[#083048]">
                <span className="text-[#3A6076] dark:text-[#9EC0D4] block text-[11px]">Sites critiques & daaras :</span>
                <span className="font-medium text-[#10344A] dark:text-white">
                  {activeZone.criticalSites}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded bg-[#E8F3FC] dark:bg-[#083048]">
                  <span className="text-[#3A6076] dark:text-[#9EC0D4] block text-[10px]">Pluie prévue :</span>
                  <span className="font-mono font-bold text-sm text-[#10344A] dark:text-white">
                    {activeZoneDynamic.rainMm} mm
                  </span>
                </div>
                <div className="p-2 rounded bg-[#E8F3FC] dark:bg-[#083048]">
                  <span className="text-[#3A6076] dark:text-[#9EC0D4] block text-[10px]">Population :</span>
                  <span className="font-mono font-bold text-sm text-[#10344A] dark:text-white">
                    {activeZone.population.toLocaleString('fr-FR')} hab.
                  </span>
                </div>
              </div>
            </div>

            {/* Bouton de sélection toggle */}
            <button
              type="button"
              onClick={() => toggleZoneSelection(activeZone.id)}
              className={`w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedZoneIds.includes(activeZone.id)
                  ? 'bg-[#1B5E8C] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/10 text-[#10344A] dark:text-white hover:bg-black/10'
              }`}
            >
              {selectedZoneIds.includes(activeZone.id) ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Zone incluse pour l'alerte ({activeZone.population} hab.)</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  <span>Inclure cette zone dans l'alerte</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
