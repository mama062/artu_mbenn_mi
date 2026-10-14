import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  MapPin, 
  Users, 
  Calendar, 
  CloudRain, 
  Send, 
  Gauge, 
  TrendingUp,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { CommuneData, ZoneData } from '../types.ts';
import { RiskSignalBadge } from './RiskSignalBadge.tsx';
import { WaterLevelTrendsChart } from './WaterLevelTrendsChart.tsx';

interface DashboardViewProps {
  commune: CommuneData;
  onSelectZoneAndGoToMap: (zoneId: string) => void;
  onGoToTrigger: (preselectedZoneIds?: string[]) => void;
  isDarkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  commune,
  onSelectZoneAndGoToMap,
  onGoToTrigger,
  isDarkMode
}) => {
  // Trier les zones par priorité (score de risque décroissant)
  const sortedZones = [...commune.zones].sort((a, b) => b.riskScore - a.riskScore);
  const mostExposedZone = sortedZones[0];

  // Calculer la population totale sous risque élevé ou très élevé
  const highRiskPopulation = sortedZones
    .filter(z => z.riskLevel === 'très élevé' || z.riskLevel === 'élevé')
    .reduce((sum, z) => sum + z.population, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* 
        ÉLÉMENT SIGNATURE : Le Matriceur de Décision Opérationnelle 10-Secondes 
        Conçu spécifiquement pour l'agent communal non-hydrologue.
        Répond immédiatement : Quelles zones alerter ? Quand ? Avec quel niveau ?
      */}
      <section
        id="decision-banner-signature"
        className={`rounded-xl border p-4 sm:p-6 shadow-md transition-all ${
          isDarkMode
            ? 'bg-[#0B2C40] border-[#174A66] text-white'
            : 'bg-white border-[#A3D4DC] text-[#10344A]'
        }`}
        aria-label="Décision opérationnelle suggérée du jour"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 border-b pb-4 sm:pb-5 mb-4 sm:mb-5 border-black/10 dark:border-white/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-[#A82222] text-white font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Décision Suggérée du Jour
              </span>
              <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                Collectivité : <strong className="text-[#10344A] dark:text-white">{commune.name}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#10344A] dark:text-white leading-snug">
              {commune.suggestedDecision.action}
            </h2>
            <p className="text-xs sm:text-sm text-[#3A6076] dark:text-[#9EC0D4] max-w-3xl leading-relaxed">
              {commune.suggestedDecision.rationale}
            </p>
          </div>

          {/* Bouton d'action directe au déclenchement */}
          <div className="shrink-0 w-full lg:w-auto pt-1 lg:pt-0">
            <button
              id="direct-trigger-cta"
              type="button"
              onClick={() => onGoToTrigger(commune.suggestedDecision.targetZones.map(name => {
                const found = commune.zones.find(z => z.name === name);
                return found ? found.id : '';
              }).filter(Boolean))}
              className="w-full lg:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg bg-[#A82222] hover:bg-[#8F1A1A] text-white font-bold text-sm shadow-md transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#F5C518]"
              aria-label="Accéder directement au déclenchement de l'alerte pour les zones prioritaires"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Déclencher l'alerte ({commune.suggestedDecision.targetCount.toLocaleString('fr-FR')} hab.)</span>
            </button>
          </div>
        </div>

        {/* 4 Indicateurs métriques clés adaptés smartphone et grand écran */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Métrique 1 : Niveau global avec 3 signaux */}
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#E8F3FC] dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] mb-1">
              <span>Risque global</span>
              <Gauge className="w-3.5 h-3.5 text-[#1B5E8C] dark:text-[#9EC0D4]" />
            </div>
            <div className="my-0.5">
              <RiskSignalBadge
                level={commune.overallRisk}
                score={mostExposedZone ? mostExposedZone.riskScore : 88}
                size="md"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Métrique 2 : Échéance opérationnelle */}
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#E8F3FC] dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] mb-1">
              <span>Échéance</span>
              <Calendar className="w-3.5 h-3.5 text-[#1B5E8C] dark:text-[#9EC0D4]" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#10344A] dark:text-white">
                {commune.leadTime}
              </div>
              <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block leading-tight">
                Pic à H+38h/42h
              </span>
            </div>
          </div>

          {/* Métrique 3 : Indice de confiance du modèle */}
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#E8F3FC] dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] mb-1">
              <span>Confiance IA</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#2E9E4F]" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#10344A] dark:text-white flex items-center gap-1.5">
                <span>{commune.modelConfidencePercent} %</span>
                <span className="text-[10px] font-normal text-[#2E9E4F] bg-[#2E9E4F]/10 px-1 py-0.2 rounded">
                  Élevée
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block leading-tight">
                3 constellations
              </span>
            </div>
          </div>

          {/* Métrique 4 : Population exposée */}
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#E8F3FC] dark:bg-[#083048] border border-[#A3D4DC] dark:border-[#174A66] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] mb-1">
              <span>Pop. menacée</span>
              <Users className="w-3.5 h-3.5 text-[#C45517]" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#10344A] dark:text-white">
                {highRiskPopulation.toLocaleString('fr-FR')} hab.
              </div>
              <span className="text-[10px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] block leading-tight">
                48 % recensés
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 
        VISUALISATION DES DONNÉES HYDROLOGIQUES : Tendances des niveaux d'eau sur 48h
        Composant Recharts haute précision avec seuils critiques (35 cm et 60 cm)
      */}
      <WaterLevelTrendsChart
        commune={commune}
        isDarkMode={isDarkMode}
        onGoToMapZone={onSelectZoneAndGoToMap}
      />

      {/* 
        CLASSEMENT DES ZONES : VERSION BUREAU (TABLEAU) & VERSION TÉLÉPHONE (CARTES TACTILES)
      */}
      <section
        id="priority-zones-section"
        className={`rounded-xl border shadow-xs overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-[#0B2C40] border-[#174A66] text-white'
            : 'bg-white border-[#A3D4DC] text-[#10344A]'
        }`}
        aria-label="Liste des zones classées par ordre de priorité"
      >
        <div className="p-3.5 sm:p-5 border-b border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-[#10344A] dark:text-white flex items-center gap-2">
              <span>Classement des 7 zones par niveau d'exposition</span>
              <span className="text-[10px] sm:text-xs font-normal text-[#3A6076] dark:text-[#9EC0D4] px-1.5 sm:px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded">
                Décroissant
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#3A6076] dark:text-[#9EC0D4] mt-0.5">
              Touchez une zone pour ouvrir la simulation cartographique à 48 heures.
            </p>
          </div>

          <div className="text-xs font-medium text-[#1B5E8C] dark:text-[#9EC0D4] flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#A82222]" />
            <span>Étape 1 : toucher la 1ère zone</span>
          </div>
        </div>

        {/* 1. VUE SMARTPHONE (MODE TÉLÉPHONE) : CARTES TACTILES FLUIDES (md:hidden) */}
        <div className="md:hidden p-3 space-y-2.5">
          {sortedZones.map((zone, index) => {
            const isCritical = index === 0;
            return (
              <div
                key={`mobile-zone-${zone.id}`}
                id={`mobile-zone-card-${zone.id}`}
                onClick={() => onSelectZoneAndGoToMap(zone.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${
                  isCritical
                    ? isDarkMode
                      ? 'bg-[#A82222]/20 border-[#A82222] shadow-sm'
                      : 'bg-[#FDECEC] border-[#F5ABAB] shadow-sm'
                    : isDarkMode
                      ? 'bg-[#083048] border-[#174A66]'
                      : 'bg-[#E8F3FC]/50 border-[#A3D4DC]'
                }`}
                role="button"
                tabIndex={0}
                aria-label={`Zone ${zone.name}, risque ${zone.riskLevel}`}
              >
                {/* En-tête de la carte mobile */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs font-mono shrink-0 ${
                      isCritical ? 'bg-[#A82222] text-white' : 'bg-[#1B5E8C] text-white'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-[#10344A] dark:text-white leading-tight">
                        {zone.name}
                      </h4>
                      <p className="text-[11px] text-[#3A6076] dark:text-[#9EC0D4] line-clamp-1 mt-0.5">
                        {zone.criticalSites}
                      </p>
                    </div>
                  </div>

                  <RiskSignalBadge
                    level={zone.riskLevel}
                    score={zone.riskScore}
                    size="sm"
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Métriques clés en colonnes */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Pluie prévue</span>
                    <span className="font-mono font-bold text-[#10344A] dark:text-white flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-[#1B5E8C]" /> {zone.rainfallForecastMm} mm
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Population</span>
                    <span className="font-mono font-bold text-[#10344A] dark:text-white flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#3A6076]" /> {zone.population.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Dernière alerte</span>
                    <span className="text-[11px] text-[#3A6076] dark:text-[#9EC0D4] truncate block">
                      {zone.lastAlertLabel}
                    </span>
                  </div>
                </div>

                {/* Bouton d'action tactile 44px minimum */}
                <div className="mt-3 pt-2 flex items-center justify-between text-xs font-bold text-[#1B5E8C] dark:text-[#F5C518]">
                  <span>Voir la carte temporelle 48 h</span>
                  <div className="min-w-[32px] min-h-[32px] rounded-full bg-[#1B5E8C]/15 dark:bg-white/10 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. VUE BUREAU / TABLETTE (TABLEAU CLASSIQUE) (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse" id="zones-priority-table">
            <thead>
              <tr className={`text-xs uppercase font-bold tracking-wider border-b ${
                isDarkMode ? 'bg-[#083048] text-[#9EC0D4] border-[#174A66]' : 'bg-[#E8F3FC] text-[#3A6076] border-[#A3D4DC]'
              }`}>
                <th scope="col" className="py-3 px-4 w-12 text-center">Rang</th>
                <th scope="col" className="py-3 px-4">Zone & Points névralgiques</th>
                <th scope="col" className="py-3 px-4">Niveau de risque (3 signaux)</th>
                <th scope="col" className="py-3 px-4">Pluie prévue</th>
                <th scope="col" className="py-3 px-4">Population WhatsApp</th>
                <th scope="col" className="py-3 px-4">Dernière alerte</th>
                <th scope="col" className="py-3 px-4">Confiance</th>
                <th scope="col" className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-sm">
              {sortedZones.map((zone, index) => {
                const isCritical = index === 0;
                return (
                  <tr
                    key={zone.id}
                    id={`zone-row-${zone.id}`}
                    onClick={() => onSelectZoneAndGoToMap(zone.id)}
                    className={`group cursor-pointer transition-colors ${
                      isCritical
                        ? isDarkMode
                          ? 'bg-[#A82222]/15 hover:bg-[#A82222]/25 font-semibold'
                          : 'bg-[#FDECEC] hover:bg-[#FCD8D8] font-semibold'
                        : isDarkMode
                          ? 'hover:bg-white/5'
                          : 'hover:bg-[#E8F3FC]/60'
                    }`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectZoneAndGoToMap(zone.id);
                      }
                    }}
                    role="button"
                    aria-label={`Inspecter la zone ${zone.name}, risque ${zone.riskLevel}`}
                  >
                    {/* Rang */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                      {isCritical ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#A82222] text-white font-bold text-xs">
                          1
                        </span>
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>

                    {/* Zone & Points névralgiques */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2">
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isCritical ? 'text-[#A82222]' : 'text-[#1B5E8C] dark:text-[#9EC0D4]'}`} />
                        <div>
                          <span className="text-[15px] font-bold text-[#10344A] dark:text-white group-hover:text-[#1B5E8C] dark:group-hover:text-[#F5C518]">
                            {zone.name}
                          </span>
                          <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4] font-normal mt-0.5 line-clamp-1">
                            {zone.criticalSites}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Risque avec 3 signaux */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskSignalBadge
                        level={zone.riskLevel}
                        score={zone.riskScore}
                        size="md"
                        isDarkMode={isDarkMode}
                      />
                    </td>

                    {/* Pluie */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-[#10344A] dark:text-white">
                        <CloudRain className="w-4 h-4 text-[#1B5E8C]" />
                        <span>{zone.rainfallForecastMm} mm</span>
                      </div>
                    </td>

                    {/* Population */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-sm text-[#10344A] dark:text-white">
                      {zone.population.toLocaleString('fr-FR')} hab.
                    </td>

                    {/* Dernière alerte */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                      {zone.lastAlertLabel}
                    </td>

                    {/* Confiance */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                      {zone.confidence} %
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B5E8C] dark:text-[#F5C518] group-hover:underline">
                        <span>Carte 48h</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
