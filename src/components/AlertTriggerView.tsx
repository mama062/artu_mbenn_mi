import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  HelpCircle,
  FileCheck,
  Check
} from 'lucide-react';
import { CommuneData, PastAlert } from '../types.ts';
import { AUDIO_MESSAGE_PREVIEWS, RISK_LEVELS } from '../mockData.js';
import { RiskSignalBadge } from './RiskSignalBadge.tsx';
import { audioSimulator } from '../utils/audioSimulator.ts';

interface AlertTriggerViewProps {
  commune: CommuneData;
  initialSelectedZoneIds?: string[];
  onAlertSent: (alert: PastAlert) => void;
  onGoToJournal: () => void;
  isDarkMode: boolean;
}

export const AlertTriggerView: React.FC<AlertTriggerViewProps> = ({
  commune,
  initialSelectedZoneIds = [],
  onAlertSent,
  onGoToJournal,
  isDarkMode
}) => {
  // Étape courante (1, 2, 3, 4)
  const [step, setStep] = useState<number>(1);

  // Étape 1 : Zones sélectionnées
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(() => {
    if (initialSelectedZoneIds.length > 0) return initialSelectedZoneIds;
    return ['gouye-mbind', 'darou-marnane'];
  });

  // Étape 2 : Niveau d'alerte (vigilance vs alerte)
  const [alertLevel, setAlertLevel] = useState<'vigilance' | 'alerte'>('alerte');

  // Étape 3 : Lecteur audio simulé
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioElapsedSeconds, setAudioElapsedSeconds] = useState<number>(0);

  // Étape 4 : Responsabilité et validation
  const [agentName, setAgentName] = useState<string>('Lamine Seck');
  const [agentMatricule, setAgentMatricule] = useState<string>('AGT-TB-408');
  const [agentConfirmedCheckbox, setAgentConfirmedCheckbox] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentAcknowledgment, setSentAcknowledgment] = useState<{
    alertId: string;
    count: number;
    zones: string[];
    timestamp: string;
  } | null>(null);

  // Nettoyage audio au démontage
  useEffect(() => {
    return () => {
      audioSimulator.stop();
    };
  }, []);

  // Calcul dynamique des destinataires
  const selectedZonesData = commune.zones.filter(z => selectedZoneIds.includes(z.id));
  const totalRecipients = selectedZonesData.reduce((sum, z) => sum + z.population, 0);

  // Message preview en fonction du niveau
  const messagePreview = (AUDIO_MESSAGE_PREVIEWS as Record<string, typeof AUDIO_MESSAGE_PREVIEWS['alerte']>)[alertLevel] || AUDIO_MESSAGE_PREVIEWS.alerte;

  // Gestion du lecteur audio simulé
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      audioSimulator.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioSimulator.playAlertChime(
        alertLevel === 'alerte' ? 'warning' : 'informative',
        messagePreview.durationSeconds,
        (sec) => setAudioElapsedSeconds(sec),
        () => {
          setIsPlayingAudio(false);
          setAudioElapsedSeconds(0);
        }
      );
    }
  };

  const handleResetAudio = () => {
    audioSimulator.stop();
    setIsPlayingAudio(false);
    setAudioElapsedSeconds(0);
  };

  // Bascule zone
  const toggleZone = (zoneId: string) => {
    setSelectedZoneIds(prev => 
      prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
    );
  };

  // Déclencher l'envoi sécurisé
  const handleConfirmAndSend = () => {
    if (selectedZoneIds.length === 0 || !agentConfirmedCheckbox || isSending) return;

    setIsSending(true);

    setTimeout(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      const newAlertId = `ALT-2026-0${Math.floor(Math.random() * 800) + 11}`;
      const zoneNames = selectedZonesData.map(z => z.name);

      const createdAlert: PastAlert = {
        id: newAlertId,
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`,
        timestamp: Date.now(),
        commune: commune.name,
        zones: zoneNames,
        level: alertLevel,
        recipientCount: totalRecipients,
        triggerAgent: `${agentName} (Permanence)`,
        agentId: agentMatricule,
        openRatePercent: 97, // Taux initial après diffusion WhatsApp
        status: 'En cours de diffusion',
        falseAlert: false,
        postAnalysisNote: `Déclenchement certifié émis par ${agentName} (${agentMatricule}). Messages vocaux et SMS acheminés sur les daaras et concessions.`
      };

      onAlertSent(createdAlert);
      setIsSending(false);
      setSentAcknowledgment({
        alertId: newAlertId,
        count: totalRecipients,
        zones: zoneNames,
        timestamp: `${day}/${month}/${year} à ${hours}:${minutes}`
      });
    }, 1100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* En-tête de la console d'alerte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B2C40] p-4 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#A82222] text-white">
              Étape 3 : Processus de Déclenchement
            </span>
            <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
              {commune.name}
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-[#10344A] dark:text-white mt-1">
            Console de déclenchement d'alerte en 4 étapes
          </h2>
        </div>

        {/* Compteur temps réel de destinataires */}
        <div className="flex items-center gap-2.5 bg-[#E8F3FC] dark:bg-[#083048] px-3.5 py-2 rounded-lg border border-[#A3D4DC] dark:border-[#174A66] self-start sm:self-auto">
          <Users className="w-4 h-4 text-[#1B5E8C]" />
          <div>
            <span className="text-[10px] sm:text-[11px] text-[#3A6076] dark:text-[#9EC0D4] block leading-none">Cible :</span>
            <span className="font-mono text-sm sm:text-base font-bold text-[#10344A] dark:text-white">
              {totalRecipients.toLocaleString('fr-FR')} hab.
            </span>
          </div>
        </div>
      </div>

      {/* Barre de progression des 4 étapes adaptée smartphone */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { num: 1, title: '1. Zones', subtitle: `${selectedZoneIds.length} zone(s)` },
          { num: 2, title: '2. Niveau', subtitle: alertLevel === 'alerte' ? 'Alerte' : 'Vigilance' },
          { num: 3, title: '3. Message', subtitle: 'Vocal wolof' },
          { num: 4, title: '4. Signature', subtitle: 'Validation' }
        ].map((s) => {
          const isCurrent = step === s.num;
          const isPassed = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`p-2.5 sm:p-3 rounded-lg border text-left transition-all cursor-pointer min-h-[50px] ${
                isCurrent
                  ? 'bg-[#1B5E8C] text-white border-[#1B5E8C] shadow-sm font-bold'
                  : isPassed
                    ? 'bg-white dark:bg-[#0B2C40] text-[#10344A] dark:text-white border-[#2E9E4F]'
                    : 'bg-white/60 dark:bg-[#0B2C40]/60 text-[#3A6076] dark:text-[#9EC0D4] border-black/10 dark:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{s.title}</span>
                {isPassed && <Check className="w-3.5 h-3.5 text-[#2E9E4F]" />}
              </div>
              <div className={`text-[10px] sm:text-[11px] mt-0.5 truncate ${isCurrent ? 'text-white/80' : 'text-[#3A6076] dark:text-[#9EC0D4]'}`}>
                {s.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* MODAL / ACCUSÉ DE RÉCEPTION DE L'ENVOI */}
      {sentAcknowledgment && (
        <div
          id="alert-acknowledgment-box"
          className="p-4 sm:p-6 rounded-xl bg-[#E7F7F0] dark:bg-[#0D3627] border-2 border-[#2E9E4F] shadow-lg space-y-4 animate-in fade-in"
          role="alert"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#2E9E4F] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E9E4F]">
                Accusé certifié — Réf : {sentAcknowledgment.alertId}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0D3627] dark:text-white">
                {sentAcknowledgment.count.toLocaleString('fr-FR')} messages WhatsApp transmis
              </h3>
              <p className="text-xs sm:text-sm text-[#1A6148] dark:text-[#E8F5F7] leading-relaxed">
                La passerelle communale a pris en charge la diffusion du message vocal en wolof et des consignes pour :{' '}
                <strong>{sentAcknowledgment.zones.join(', ')}</strong> à {sentAcknowledgment.timestamp}.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#2E9E4F]/30">
            <span className="text-xs text-[#1A6148] dark:text-[#A6E4CC]">
              Traçabilité légale horodatée inscrite au registre.
            </span>
            <button
              id="view-journal-cta"
              type="button"
              onClick={onGoToJournal}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E3A50] hover:bg-[#083048] text-white text-sm font-bold rounded-lg shadow-xs cursor-pointer"
            >
              <span>Consulter le journal des alertes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL PAR ÉTAPE (SI NON ENCORE ENVOYÉ) */}
      {!sentAcknowledgment && (
        <div className="p-4 sm:p-6 rounded-xl border border-[#A3D4DC] dark:border-[#174A66] bg-white dark:bg-[#0B2C40] shadow-xs space-y-5">
          {/* ÉTAPE 1 : Sélection des zones avec compteur dynamique */}
          {step === 1 && (
            <div className="space-y-4" id="step-1-zones">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#10344A] dark:text-white">
                  Étape 1 sur 4 — Sélection des zones à cibler
                </h3>
                <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                  Cochez les zones à intégrer. Le nombre de destinataires se recalcule instantanément.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {commune.zones.map((zone) => {
                  const isChecked = selectedZoneIds.includes(zone.id);
                  return (
                    <label
                      key={zone.id}
                      className={`min-h-[52px] flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#1B5E8C] bg-[#E8F3FC] dark:bg-[#083048]'
                          : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleZone(zone.id)}
                          className="w-4 h-4 accent-[#1B5E8C] cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-sm text-[#10344A] dark:text-white">
                            {zone.name}
                          </span>
                          <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4] ml-1.5">
                            ({zone.population.toLocaleString('fr-FR')} hab.)
                          </span>
                        </div>
                      </div>

                      <RiskSignalBadge
                        level={zone.riskLevel}
                        score={zone.riskScore}
                        size="sm"
                        isDarkMode={isDarkMode}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <span className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                  Sélection : <strong className="text-[#10344A] dark:text-white">{selectedZoneIds.length} zone(s)</strong> ({totalRecipients.toLocaleString('fr-FR')} hab.)
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectedZoneIds.length === 0}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B5E8C] hover:bg-[#0E3A50] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer disabled:bg-gray-300"
                >
                  <span>Valider et passer à l'étape 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Choix du niveau (Vigilance vs Alerte) */}
          {step === 2 && (
            <div className="space-y-4" id="step-2-tier">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#10344A] dark:text-white">
                  Étape 2 sur 4 — Choix du niveau d'alerte
                </h3>
                <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                  Conditionne la tonalité de la note vocale en wolof et les consignes d'évacuation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Option Vigilance */}
                <div
                  onClick={() => setAlertLevel('vigilance')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[120px] ${
                    alertLevel === 'vigilance'
                      ? 'border-[#D48806] bg-[#FEF8E7] dark:bg-[#3D2802] shadow-sm'
                      : 'border-black/10 dark:border-white/10 hover:border-[#D48806]/50'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-[#10344A] dark:text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#D48806]" />
                      Niveau VIGILANCE
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      Préventif
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#8F5A02] dark:text-[#F5D78E] mb-1.5">
                    Recommandation de préparation passive sans consigne d'évacuation immédiate.
                  </p>
                  <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4] leading-relaxed">
                    Surélévation des denrées, surveillance des enfants, dégagement des caniveaux.
                  </p>
                </div>

                {/* Option Alerte */}
                <div
                  onClick={() => setAlertLevel('alerte')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[120px] ${
                    alertLevel === 'alerte'
                      ? 'border-[#A82222] bg-[#FDECEC] dark:bg-[#470D0D] shadow-sm'
                      : 'border-black/10 dark:border-white/10 hover:border-[#A82222]/50'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-[#10344A] dark:text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#A82222]" />
                      Niveau ALERTE
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#A82222] text-white">
                      Prioritaire
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#A82222] dark:text-[#F5ABAB] mb-1.5">
                    Ordre formel de mise en sécurité active et évacuation des daaras vulnérables.
                  </p>
                  <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4] leading-relaxed">
                    Coupure électrique préventive, repli sur points hauts désignés, assistance prioritaire.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[44px] flex items-center justify-center text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] hover:underline"
                >
                  ← Revenir au choix des zones
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B5E8C] hover:bg-[#0E3A50] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  <span>Valider et écouter le message vocal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Aperçu bilingue & Synthèse vocale Wolof */}
          {step === 3 && (
            <div className="space-y-4" id="step-3-preview">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#10344A] dark:text-white">
                  Étape 3 sur 4 — Note vocale WhatsApp en Wolof et consignes
                </h3>
                <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                  Écoutez le message audio simulé qui sera envoyé aux répertoires WhatsApp des quartiers ciblés.
                </p>
              </div>

              {/* Console audio WhatsApp simulée */}
              <div className="p-4 rounded-xl bg-[#E7F7F0] dark:bg-[#0B3625] border-2 border-[#2E9E4F] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-[#2E9E4F]" />
                    <span className="font-bold text-sm text-[#0D3627] dark:text-white">
                      Message vocal WhatsApp (Wolof) — Durée : {messagePreview.durationSeconds} s
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#2E9E4F] bg-white dark:bg-[#083048] px-2 py-0.5 rounded">
                    {audioElapsedSeconds}s / {messagePreview.durationSeconds}s
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    id="audio-play-btn"
                    type="button"
                    onClick={handleToggleAudio}
                    className="min-w-[48px] min-h-[48px] rounded-full bg-[#2E9E4F] hover:bg-[#258340] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer focus:ring-2 focus:ring-[#F5C518]"
                    aria-label={isPlayingAudio ? 'Mettre en pause' : 'Écouter le message vocal en wolof'}
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAudio}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#3A6076] dark:text-[#9EC0D4]"
                    title="Recommencer"
                    aria-label="Recommencer la lecture"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Fausse onde sonore réactive */}
                  <div className="grow h-7 flex items-center gap-1 overflow-hidden px-2 bg-[#E8F3FC] dark:bg-[#083048] rounded">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const progressRatio = audioElapsedSeconds / messagePreview.durationSeconds;
                      const isPlayed = i / 28 <= progressRatio;
                      const barHeight = 6 + ((i * 7) % 18);
                      return (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-200 ${
                            isPlayed ? 'bg-[#2E9E4F]' : 'bg-[#CBDCE8] dark:bg-[#1B475E]'
                          } ${isPlayingAudio && isPlayed ? 'scale-y-125' : ''}`}
                          style={{ height: `${barHeight}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Textes bilingues côte à côte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* Texte en Wolof avec mention obligatoire */}
                <div className="p-3.5 rounded-lg bg-white dark:bg-[#0B2C40] border border-[#A3D4DC] dark:border-[#174A66] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#10344A] dark:text-white uppercase tracking-wider">
                      Transcription Wolof
                    </span>
                    <span className="text-[10px] font-mono text-[#A82222] dark:text-[#F5ABAB] bg-[#A82222]/10 px-1.5 py-0.5 rounded">
                      {messagePreview.wolofDisclaimer}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm italic font-serif text-[#10344A] dark:text-white leading-relaxed">
                    « {messagePreview.wolofText} »
                  </p>
                </div>

                {/* Texte en Français */}
                <div className="p-3.5 rounded-lg bg-white dark:bg-[#0B2C40] border border-[#A3D4DC] dark:border-[#174A66] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10344A] dark:text-white uppercase tracking-wider">
                      Texte Français de référence
                    </span>
                    <span className="text-[10px] font-mono text-[#1B5E8C] dark:text-[#9EC0D4]">
                      Version officielle
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3A6076] dark:text-[#E8F3FC] leading-relaxed">
                    {messagePreview.frenchText}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[44px] flex items-center justify-center text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] hover:underline"
                >
                  ← Revenir au niveau
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B5E8C] hover:bg-[#0E3A50] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  <span>Passer à la validation et signature</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : Confirmation chiffrée & Signature de l'agent */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-5" id="step-4-confirm">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#10344A] dark:text-white">
                  Étape 4 sur 4 — Récapitulatif chiffré et signature de l'agent
                </h3>
                <p className="text-xs text-[#3A6076] dark:text-[#9EC0D4]">
                  L'envoi requiert la validation formelle et la signature de permanence.
                </p>
              </div>

              {/* Récapitulatif chiffré */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#E8F3FC] dark:bg-[#082333] border border-[#A3D4DC] dark:border-[#174A66] space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#10344A] dark:text-white block">
                  Bilan opérationnel avant déclenchement
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-white dark:bg-[#0B2C40]">
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Zones :</span>
                    <strong className="text-xs sm:text-sm text-[#10344A] dark:text-white truncate block">{selectedZonesData.map(z => z.name).join(', ')}</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#0B2C40]">
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Population :</span>
                    <strong className="text-xs sm:text-sm font-mono text-[#10344A] dark:text-white">{totalRecipients.toLocaleString('fr-FR')} hab.</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#0B2C40]">
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Niveau :</span>
                    <strong className="text-xs sm:text-sm uppercase text-[#A82222] dark:text-[#F5ABAB]">{alertLevel}</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#0B2C40]">
                    <span className="text-[10px] text-[#3A6076] dark:text-[#9EC0D4] block">Canal :</span>
                    <strong className="text-xs sm:text-sm text-[#10344A] dark:text-white">WhatsApp Wolof</strong>
                  </div>
                </div>
              </div>

              {/* Formulaire de signature de l'agent responsable */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-3 bg-white dark:bg-[#0B2C40]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#10344A] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2E9E4F]" />
                  Signature de permanence territoriale
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="agent-name" className="block text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] mb-1">
                      Nom de l'agent :
                    </label>
                    <input
                      id="agent-name"
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm rounded border border-black/20 dark:border-white/20 bg-[#E8F3FC] dark:bg-[#083048] text-[#10344A] dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="agent-matricule" className="block text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] mb-1">
                      Matricule de permanence :
                    </label>
                    <input
                      id="agent-matricule"
                      type="text"
                      value={agentMatricule}
                      onChange={(e) => setAgentMatricule(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm rounded border border-black/20 dark:border-white/20 bg-[#E8F3FC] dark:bg-[#083048] text-[#10344A] dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Checkbox de double confirmation */}
                <label className="min-h-[50px] flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 cursor-pointer">
                  <input
                    id="agent-confirmation-checkbox"
                    type="checkbox"
                    checked={agentConfirmedCheckbox}
                    onChange={(e) => setAgentConfirmedCheckbox(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-[#A82222] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    Je certifie avoir pris connaissance du modèle hydrologique 48h et confirme l'ordre d'émission immédiat des messages WhatsApp aux <strong>{totalRecipients.toLocaleString('fr-FR')} habitants</strong>.
                  </span>
                </label>
              </div>

              {/* Bouton de déclenchement final */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[44px] flex items-center justify-center text-xs font-semibold text-[#3A6076] dark:text-[#9EC0D4] hover:underline"
                >
                  ← Revoir le message
                </button>

                <button
                  id="final-send-alert-button"
                  type="button"
                  onClick={handleConfirmAndSend}
                  disabled={!agentConfirmedCheckbox || isSending}
                  className={`w-full sm:w-auto min-h-[50px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg font-bold text-sm shadow-md transition-all ${
                    agentConfirmedCheckbox && !isSending
                      ? 'bg-[#A82222] hover:bg-[#8F1A1A] text-white cursor-pointer focus:ring-2 focus:ring-[#F5C518]'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>
                    {isSending
                      ? 'Transmission en cours...'
                      : `Confirmer et diffuser (${totalRecipients.toLocaleString('fr-FR')} hab.)`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
