import React, { useState, useEffect } from 'react';
import { ScreenId, PastAlert, CommuneData } from './types.ts';
import { COMMUNES_DATA, PAST_ALERTS } from './mockData.js';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { RiskMapView } from './components/RiskMapView.tsx';
import { AlertTriggerView } from './components/AlertTriggerView.tsx';
import { AlertJournalView } from './components/AlertJournalView.tsx';
import { PlaceholderView } from './components/PlaceholderView.tsx';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  // Menu mobile ouvert / fermé
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Collectivité active (Touba Mosquée par défaut, Mbacké sélectionnable)
  const [currentCommuneId, setCurrentCommuneId] = useState<string>('touba-mosquee');

  // Mode sombre / clair (clair par défaut pour projection en salle éclairée)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // État de transit pour le parcours de démonstration en 4 clics
  const [targetZoneForMap, setTargetZoneForMap] = useState<string | undefined>('gouye-mbind');
  const [targetZonesForTrigger, setTargetZonesForTrigger] = useState<string[]>(['gouye-mbind', 'darou-marnane']);

  // État en mémoire du journal des alertes
  const [alertsHistory, setAlertsHistory] = useState<PastAlert[]>(PAST_ALERTS as unknown as PastAlert[]);

  // Récupérer les données de la commune active
  const activeCommune: CommuneData = (COMMUNES_DATA as Record<string, CommuneData>)[currentCommuneId] || COMMUNES_DATA['touba-mosquee'];

  // Synchronisation de la classe dark sur <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Navigation avec fermeture automatique du tiroir mobile
  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
  };

  // Clic 1 : Depuis le tableau de bord, clic sur la zone la plus exposée -> ouvre la carte
  const handleSelectZoneAndGoToMap = (zoneId: string) => {
    setTargetZoneForMap(zoneId);
    setTargetZonesForTrigger([zoneId]);
    setCurrentScreen('map');
    setIsMobileMenuOpen(false);
  };

  // Clic 2 : Depuis la carte, clic sur "Préparer l'alerte" -> ouvre le déclenchement
  const handleGoToTrigger = (selectedZoneIds?: string[]) => {
    if (selectedZoneIds && selectedZoneIds.length > 0) {
      setTargetZonesForTrigger(selectedZoneIds);
    }
    setCurrentScreen('trigger');
    setIsMobileMenuOpen(false);
  };

  // Clic 3 & 4 : Confirmation d'envoi et enregistrement dans le journal
  const handleAlertSent = (newAlert: PastAlert) => {
    setAlertsHistory(prev => [newAlert, ...prev]);
  };

  const handleGoToJournal = () => {
    setCurrentScreen('journal');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDarkMode ? 'bg-[#061D2B] text-[#E8F3FC]' : 'bg-[#E8F3FC] text-[#10344A]'
    }`}>
      {/* En-tête permanent avec contrôles et bascule menu mobile */}
      <Header
        currentCommuneId={currentCommuneId}
        onCommuneChange={(id) => {
          setCurrentCommuneId(id);
          const comm = (COMMUNES_DATA as Record<string, CommuneData>)[id];
          if (comm && comm.zones.length > 0) {
            setTargetZoneForMap(comm.zones[0].id);
            setTargetZonesForTrigger([comm.zones[0].id]);
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Corps avec barre latérale (bureau + tiroir mobile) et zone de travail */}
      <div className="flex grow overflow-hidden relative">
        {/* Barre de navigation latérale / Tiroir mobile */}
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          isDarkMode={isDarkMode}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Zone de contenu défilante avec marge basse pour la barre mobile */}
        <main
          id="main-content-area"
          className="grow p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto focus:outline-hidden"
          tabIndex={-1}
        >
          {/* Écran 1 : Tableau de bord */}
          {currentScreen === 'dashboard' && (
            <DashboardView
              commune={activeCommune}
              onSelectZoneAndGoToMap={handleSelectZoneAndGoToMap}
              onGoToTrigger={handleGoToTrigger}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Écran 2 : Carte des risques temporelle 0-48h */}
          {currentScreen === 'map' && (
            <RiskMapView
              commune={activeCommune}
              initialSelectedZoneId={targetZoneForMap}
              onGoToTrigger={handleGoToTrigger}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Écran 3 : Déclenchement de l'alerte en 4 étapes */}
          {currentScreen === 'trigger' && (
            <AlertTriggerView
              commune={activeCommune}
              initialSelectedZoneIds={targetZonesForTrigger}
              onAlertSent={handleAlertSent}
              onGoToJournal={handleGoToJournal}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Écran 4 : Journal des alertes et traçabilité légale */}
          {currentScreen === 'journal' && (
            <AlertJournalView
              alerts={alertsHistory}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Écrans secondaires affichant l'état 'bientôt disponible' */}
          {(currentScreen === 'field-reports' || currentScreen === 'beneficiaries' || currentScreen === 'settings') && (
            <PlaceholderView
              screenId={currentScreen}
              onBackToDashboard={() => handleNavigate('dashboard')}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* Barre de navigation inférieure fixe pour smartphone */}
      <MobileBottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
