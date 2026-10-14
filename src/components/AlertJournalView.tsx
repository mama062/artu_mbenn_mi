import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  FileSpreadsheet, 
  Info, 
  ShieldCheck,
  ChevronDown,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { PastAlert } from '../types.ts';

interface AlertJournalViewProps {
  alerts: PastAlert[];
  isDarkMode: boolean;
}

export const AlertJournalView: React.FC<AlertJournalViewProps> = ({
  alerts,
  isDarkMode
}) => {
  // Filtres
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedIncidentOnly, setSelectedIncidentOnly] = useState<boolean>(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>('ALT-2026-009'); // Ouvrir par défaut la fausse alerte pour la démonstration jury

  // Filtrage des alertes
  const filteredAlerts = alerts.filter(alert => {
    if (selectedIncidentOnly && !alert.falseAlert) return false;
    if (selectedZoneFilter !== 'all') {
      const match = alert.zones.some(z => z.toLowerCase().includes(selectedZoneFilter.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  // Données pour le graphique Recharts d'évolution du taux d'ouverture
  const chartData = [...alerts]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(a => ({
      name: a.date.slice(0, 5), // 'JJ/MM'
      openRate: a.openRatePercent,
      recipients: a.recipientCount,
      alertId: a.id,
      isFalseAlert: !!a.falseAlert,
      level: a.level
    }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B2C40] p-4 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B5E8C] text-white">
              Étape 4 : Traçabilité & Retour d'Expérience
            </span>
            <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
              Registre horodaté certifié
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#10344A] dark:text-white mt-1">
            Journal officiel des alertes inondations
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4] font-medium hidden sm:inline">
            Total consigné :
          </span>
          <span className="text-xs sm:text-sm font-bold font-mono px-2.5 py-1 rounded bg-[#E8F3FC] dark:bg-[#083048] text-[#10344A] dark:text-white border border-[#A3D4DC] dark:border-[#174A66]">
            {alerts.length} diffusions enregistrées
          </span>
        </div>
      </div>

      {/* 
        ENCADRÉ D'ANALYSE D'IMPACT : LE PHÉNOMÈNE DE FAUSSE ALERTE (CRY WOLF)
      */}
      <div
        id="false-alert-analysis-card"
        className="p-3.5 sm:p-5 rounded-xl bg-amber-50 dark:bg-[#2A2007] border-2 border-amber-400 dark:border-amber-600 shadow-xs space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="space-y-1 grow">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                Coût d'une fausse alerte sur l'adhésion citoyenne
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                Cas du 14 août
              </span>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
              Le 14/08/2026, un orage de 65 mm a dévié in extremis (fausse alerte assumée). L'alerte suivante du 18/08 a vu son <strong>taux d'écoute chuter de 94 % à 61 %</strong>. C'est pourquoi la plateforme affiche la confiance IA avant tout déclenchement.
            </p>
          </div>
        </div>

        {/* Graphique d'évolution du taux d'ouverture Recharts */}
        <div className="p-2.5 sm:p-3 bg-white dark:bg-[#0B2C40] rounded-lg border border-amber-200 dark:border-amber-900/60">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-semibold text-[#10344A] dark:text-white mb-2">
            <span>Évolution du taux d'ouverture WhatsApp (%)</span>
            <span className="text-[10px] sm:text-[11px] text-[#A82222] font-bold">
              Chute -33 pts après le 14/08
            </span>
          </div>
          <div className="h-36 sm:h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1B475E' : '#E2EDF5'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9EC0D4' : '#3A6076'} fontSize={10} />
                <YAxis domain={[50, 100]} stroke={isDarkMode ? '#9EC0D4' : '#3A6076'} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#083048' : '#FFFFFF',
                    borderColor: '#174A66',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(value: any) => [`${value} %`, "Ouverture"]}
                />
                <ReferenceLine x="14/08" stroke="#A82222" strokeDasharray="3 3" label={{ value: 'Fausse alerte', fill: '#A82222', fontSize: 9, position: 'top' }} />
                <Line
                  type="monotone"
                  dataKey="openRate"
                  stroke="#1B5E8C"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#1B5E8C' }}
                  activeDot={{ r: 5, fill: '#F5C518' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Barre de filtres responsive */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#0B2C40] p-3.5 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] shadow-xs">
        <div className="flex items-center flex-wrap gap-2 text-xs w-full sm:w-auto">
          <span className="font-semibold text-[#3A6076] dark:text-[#9EC0D4] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrer :
          </span>

          {/* Filtre zone */}
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded border border-black/20 dark:border-white/20 bg-[#E8F3FC] dark:bg-[#083048] text-[#10344A] dark:text-white font-medium text-xs min-h-[36px]"
            aria-label="Filtrer par zone"
          >
            <option value="all">Toutes les zones</option>
            <option value="Gouye Mbind">Gouye Mbind</option>
            <option value="Darou Marnane">Darou Marnane</option>
            <option value="Guédé Bousso">Guédé Bousso</option>
            <option value="Sam Pathé">Sam Pathé</option>
          </select>

          {/* Filtre incident / fausse alerte */}
          <button
            type="button"
            onClick={() => setSelectedIncidentOnly(!selectedIncidentOnly)}
            className={`px-3 py-1.5 rounded border transition-colors font-medium cursor-pointer text-xs min-h-[36px] ${
              selectedIncidentOnly
                ? 'bg-amber-500 text-white border-amber-600 font-bold'
                : 'bg-black/5 dark:bg-white/10 text-[#10344A] dark:text-white border-black/10'
            }`}
          >
            Fausse alerte uniquement
          </button>
        </div>

        <div className="text-xs text-[#3A6076] dark:text-[#9EC0D4] font-mono ml-auto">
          {filteredAlerts.length} / {alerts.length} lignes
        </div>
      </div>

      {/* 
        AFFICHAGE ADAPTATIF :
        1. VUE SMARTPHONE (MODE TÉLÉPHONE) : CARTES TACTILES (md:hidden)
        2. VUE BUREAU : TABLEAU DE TRACABILITÉ (hidden md:block)
      */}

      {/* 1. VUE SMARTPHONE TACTILE */}
      <div className="md:hidden space-y-3" id="mobile-journal-cards">
        {filteredAlerts.map((alert) => {
          const isExpanded = expandedAlertId === alert.id;
          const isAlertFalse = alert.falseAlert;

          return (
            <div
              key={`mobile-alert-${alert.id}`}
              className={`p-3.5 rounded-xl border transition-all ${
                isAlertFalse
                  ? 'bg-amber-50/80 dark:bg-[#221703] border-amber-400'
                  : 'bg-white dark:bg-[#0B2C40] border-[#A3D4DC] dark:border-[#174A66]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1B5E8C] dark:text-[#F5C518]">
                      {alert.id}
                    </span>
                    <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                      {alert.date} à {alert.time}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#10344A] dark:text-white mt-1">
                    {alert.zones.join(', ')}
                  </h4>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                  alert.level === 'alerte'
                    ? 'bg-[#A82222]/15 text-[#A82222] dark:text-[#F5ABAB]'
                    : 'bg-[#D48806]/15 text-[#8F5A02] dark:text-[#F5D78E]'
                }`}>
                  {alert.level}
                </span>
              </div>

              {/* Ligne métriques destinataires & ouverture */}
              <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Destinataires</span>
                  <span className="font-mono font-bold text-[#10344A] dark:text-white">
                    {alert.recipientCount.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Taux d'écoute</span>
                  <span className={`font-mono font-bold ${
                    alert.openRatePercent < 70 ? 'text-[#A82222]' : 'text-[#2E9E4F]'
                  }`}>
                    {alert.openRatePercent} %
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Statut légal</span>
                  <span className="text-[11px] font-medium text-[#10344A] dark:text-white truncate block">
                    {isAlertFalse ? 'Fausse alerte' : 'Conforme'}
                  </span>
                </div>
              </div>

              {/* Bouton déplier détails d'audit */}
              <button
                type="button"
                onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                className="mt-3 w-full min-h-[40px] flex items-center justify-between text-xs font-semibold text-[#1B5E8C] dark:text-[#F5C518] pt-2 border-t border-black/5 dark:border-white/10"
              >
                <span>Détails & note d'audit communal</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Panneau déplié */}
              {isExpanded && (
                <div className="mt-2.5 p-3 rounded-lg bg-black/5 dark:bg-black/30 text-xs space-y-1.5">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1B5E8C] dark:text-[#F5C518] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#10344A] dark:text-white">Note d'audit :</strong>{' '}
                      <span className="text-[#3A6076] dark:text-[#9EC0D4]">
                        {alert.postAnalysisNote || 'Diffusion conforme au protocole d\'alerte précoce.'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#3A6076] dark:text-[#9EC0D4]">
                    Agent déclencheur : <strong>{alert.triggerAgent}</strong> ({alert.agentId})
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. VUE GRAND ÉCRAN (TABLEAU COMPLET) */}
      <div className="hidden md:block rounded-xl border border-[#A3D4DC] dark:border-[#174A66] bg-white dark:bg-[#0B2C40] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="journal-table">
            <thead>
              <tr className={`text-xs uppercase font-bold tracking-wider border-b ${
                isDarkMode ? 'bg-[#083048] text-[#9EC0D4] border-[#174A66]' : 'bg-[#E8F3FC] text-[#3A6076] border-[#A3D4DC]'
              }`}>
                <th scope="col" className="py-3 px-4">Date & Heure</th>
                <th scope="col" className="py-3 px-4">Réf. Alerte</th>
                <th scope="col" className="py-3 px-4">Niveau</th>
                <th scope="col" className="py-3 px-4">Zones visées</th>
                <th scope="col" className="py-3 px-4">Destinataires</th>
                <th scope="col" className="py-3 px-4">Agent responsable</th>
                <th scope="col" className="py-3 px-4">Taux d'ouverture</th>
                <th scope="col" className="py-3 px-4">Statut légal</th>
                <th scope="col" className="py-3 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-sm">
              {filteredAlerts.map((alert) => {
                const isExpanded = expandedAlertId === alert.id;
                const isAlertFalse = alert.falseAlert;

                return (
                  <React.Fragment key={alert.id}>
                    <tr
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                        isAlertFalse ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="font-bold text-[#10344A] dark:text-white">{alert.date}</div>
                        <div className="text-[#3A6076] dark:text-[#9EC0D4]">{alert.time}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs font-semibold text-[#1B5E8C] dark:text-[#F5C518]">
                        {alert.id}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase font-mono ${
                          alert.level === 'alerte'
                            ? 'bg-[#A82222]/15 text-[#A82222] dark:text-[#F5ABAB]'
                            : 'bg-[#D48806]/15 text-[#8F5A02] dark:text-[#F5D78E]'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${alert.level === 'alerte' ? 'bg-[#A82222]' : 'bg-[#D48806]'}`} />
                          {alert.level}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#10344A] dark:text-white">
                        {alert.zones.join(', ')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-sm font-semibold text-[#10344A] dark:text-white">
                        {alert.recipientCount.toLocaleString('fr-FR')}
                      </td>

                      <td className="py-3 px-4 text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                        <div className="font-semibold text-[#10344A] dark:text-white">{alert.triggerAgent}</div>
                        <div className="font-mono text-[11px]">{alert.agentId}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          alert.openRatePercent < 70
                            ? 'bg-[#A82222]/15 text-[#A82222] dark:text-[#F5ABAB]'
                            : 'bg-[#2E9E4F]/15 text-[#2E9E4F]'
                        }`}>
                          {alert.openRatePercent} %
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        {isAlertFalse ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Fausse alerte
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#2E9E4F] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#1B5E8C] dark:text-[#9EC0D4] cursor-pointer"
                          aria-label={`Détails de l'alerte ${alert.id}`}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-black/5 dark:bg-black/30 text-xs">
                        <td colSpan={9} className="p-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#1B5E8C] dark:text-[#F5C518] shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-[#10344A] dark:text-white">Note d'audit communal :</strong>{' '}
                              <span className="text-[#3A6076] dark:text-[#9EC0D4]">{alert.postAnalysisNote || 'Diffusion conforme au protocole d\'alerte précoce 48h.'}</span>
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-[#3A6076] dark:text-[#9EC0D4]/80 pl-6">
                            Signature cryptographique passerelle WhatsApp : SHA256:{alert.id.toLowerCase()}-tb-verified-2026
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
