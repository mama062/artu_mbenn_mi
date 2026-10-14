import React from 'react';
import { ShieldAlert, RefreshCw, Sun, Moon, Info, Clock, AlertTriangle, Menu, X, Smartphone } from 'lucide-react';
import { COMMUNES_DATA } from '../mockData.js';

interface HeaderProps {
  currentCommuneId: string;
  onCommuneChange: (id: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCommuneId,
  onCommuneChange,
  isDarkMode,
  onToggleDarkMode,
  isMobileMenuOpen = false,
  onToggleMobileMenu
}) => {
  const currentCommune = COMMUNES_DATA[currentCommuneId as keyof typeof COMMUNES_DATA] || COMMUNES_DATA['touba-mosquee'];
  const isDataStale = currentCommune.sensorFreshnessHours > 6.0;

  return (
    <header className="w-full shrink-0 flex flex-col z-30 shadow-xs">
      {/* Bandeau données de démonstration permanent */}
      <div
        id="demo-banner"
        className="w-full bg-[#083048] text-white px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between text-xs tracking-wide border-b border-[#1B5E8C]/40 gap-1.5"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-[#F5C518] text-[#083048] font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded font-mono shrink-0">
            PROTOTYPE JURY 2026
          </span>
          <span className="font-medium text-[#E8F3FC] text-[11px] sm:text-xs truncate max-w-[220px] sm:max-w-none">
            Environnement opérationnel — Force-N Innovation Challenge
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-[#9EC0D4] text-[11px] sm:text-xs">
          <span className="hidden md:inline-flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#F5C518]" />
            Données Sentinel-1 & ECMWF
          </span>
          <span className="font-mono text-[#E8F3FC] bg-black/25 px-1.5 py-0.5 rounded">
            Touba / Mbacké — 48 h
          </span>
        </div>
      </div>

      {/* Barre d'en-tête principale responsive */}
      <div className={`w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 border-b ${
        isDarkMode ? 'bg-[#0E3A50] border-[#174A66] text-white' : 'bg-[#0E3A50] border-[#083048] text-white'
      }`}>
        {/* Identité produit & bouton menu mobile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Bouton Hamburger visible sur téléphone uniquement */}
          {onToggleMobileMenu && (
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#083048] text-[#E8F3FC] border border-[#1B5E8C] hover:bg-[#1B5E8C] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#F5C518] cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1B5E8C] flex items-center justify-center border border-[#176B7E] shadow-inner shrink-0">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5C518]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                ARTU MBËNN MI
              </h1>
              <span className="text-[10px] sm:text-[12px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-[#176B7E]/60 text-[#E8F3FC] border border-[#176B7E] whitespace-nowrap">
                Alerte 48h
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9EC0D4] leading-tight hidden xs:block sm:block line-clamp-1">
              Anticipation inondations & alertes vocales WhatsApp Wolof
            </p>
          </div>
        </div>

        {/* Contrôles opérationnels : Sélecteur de collectivité, fraîcheur et thème */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 ml-auto">
          {/* Sélecteur de collectivité */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#083048] px-2.5 sm:px-3 py-1.5 rounded-md border border-[#1B5E8C]">
            <label htmlFor="commune-select" className="text-[11px] sm:text-xs font-semibold text-[#9EC0D4] whitespace-nowrap hidden sm:inline">
              Commune :
            </label>
            <select
              id="commune-select"
              value={currentCommuneId}
              onChange={(e) => onCommuneChange(e.target.value)}
              className="bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#F5C518] cursor-pointer min-h-[36px]"
              aria-label="Sélectionner la commune de surveillance"
            >
              <option value="touba-mosquee" className="bg-[#083048] text-white">Touba Mosquée</option>
              <option value="mbacke-commune" className="bg-[#083048] text-white">Mbacké</option>
            </select>
          </div>

          {/* Fraîcheur des données météo avec signalement strict si > 6h */}
          <div
            id="weather-freshness-badge"
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md border text-xs font-medium ${
              isDataStale
                ? 'bg-amber-900/40 text-amber-200 border-amber-500'
                : 'bg-[#083048] text-[#E8F3FC] border-[#1B5E8C]'
            }`}
            title={`Source : ${currentCommune.weatherDataSource}`}
          >
            {isDataStale ? (
              <AlertTriangle className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-[#2E9E4F] shrink-0" />
            )}
            <div className="flex flex-col text-left">
              <span className="text-[10px] sm:text-[11px] text-[#9EC0D4] hidden sm:flex items-center gap-1">
                <Clock className="w-3 h-3" /> Météo :
              </span>
              <span className="font-mono text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
                {currentCommune.lastUpdateLabel.split(' ')[0]}
              </span>
            </div>
            {isDataStale && (
              <span className="bg-[#F5C518] text-black text-[9px] sm:text-[10px] font-bold px-1 py-0.2 rounded ml-0.5">
                &gt;6h
              </span>
            )}
          </div>

          {/* Bascule Thème Clair / Thème Sombre */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-md bg-[#083048] hover:bg-[#1B5E8C] text-[#E8F3FC] border border-[#1B5E8C] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#F5C518]"
            aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
            title={isDarkMode ? 'Mode clair (projection)' : 'Mode sombre (salle)'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#F5C518]" /> : <Moon className="w-4 h-4 text-[#E8F3FC]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
