import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Send, 
  History, 
  Radio, 
  Users, 
  Settings,
  X,
  ShieldAlert
} from 'lucide-react';
import { ScreenId } from '../types.ts';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isDarkMode: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  isDarkMode,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const primaryNavItems: { id: ScreenId; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: 'Urgent'
    },
    {
      id: 'map',
      label: 'Carte des risques',
      icon: Map
    },
    {
      id: 'trigger',
      label: 'Déclenchement d\'alerte',
      icon: Send,
      badge: '4 étapes'
    },
    {
      id: 'journal',
      label: 'Journal des alertes',
      icon: History
    }
  ];

  const secondaryNavItems: { id: ScreenId; label: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'field-reports',
      label: 'Retours terrain',
      icon: Radio
    },
    {
      id: 'beneficiaries',
      label: 'Bénéficiaires WhatsApp',
      icon: Users
    },
    {
      id: 'settings',
      label: 'Paramètres & Modèles',
      icon: Settings
    }
  ];

  const handleItemClick = (screen: ScreenId) => {
    onNavigate(screen);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full select-none">
      {/* En-tête de la barre latérale */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1B5E8C] flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-4 h-4 text-[#F5C518]" />
          </div>
          <span className="text-xs uppercase tracking-wider font-bold text-white font-mono">
            Navigation Déroulée
          </span>
        </div>
        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-[#9EC0D4] hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation principale active : Les 4 étapes d'alerte */}
      <nav className="p-3 space-y-1.5 shrink-0" aria-label="Processus d'alerte 48h">
        <div className="px-3 py-1 text-[11px] font-bold text-[#9EC0D4] uppercase tracking-wider">
          Processus d'alerte 48h
        </div>
        {primaryNavItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left group min-h-[44px] cursor-pointer ${
                isActive
                  ? 'bg-[#1B5E8C] text-white font-bold shadow-xs border-l-4 border-[#F5C518]'
                  : 'text-[#E8F3FC] hover:bg-white/10 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F5C518]' : 'text-[#9EC0D4] group-hover:text-white'}`} />
                <span className="text-[13px]">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                    item.badge === 'Urgent'
                      ? 'bg-[#A82222] text-white'
                      : 'bg-[#F5C518] text-[#083048]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Séparateur visuel */}
      <div className="px-4 py-1">
        <div className="h-px bg-white/10" />
      </div>

      {/* Modules secondaires */}
      <nav className="p-3 space-y-1.5 grow" aria-label="Modules complémentaires">
        <div className="px-3 py-1 text-[11px] font-bold text-[#9EC0D4] uppercase tracking-wider">
          Modules complémentaires
        </div>
        {secondaryNavItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm transition-colors text-left min-h-[40px] cursor-pointer ${
                isActive
                  ? 'bg-[#1B5E8C] text-white font-semibold'
                  : 'text-[#9EC0D4] hover:bg-white/5 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 text-[#9EC0D4]" />
                <span className="text-[13px]">{item.label}</span>
              </div>
              <span className="text-[10px] text-[#9EC0D4]/70 italic">
                Bientôt
              </span>
            </button>
          );
        })}
      </nav>

      {/* Profil de permanence de l'agent communal */}
      <div className="p-3.5 m-3 rounded-lg bg-black/25 border border-white/10 shrink-0">
        <div className="text-[11px] text-[#9EC0D4] font-medium">
          Agent communal en service :
        </div>
        <div className="text-xs font-bold text-white mt-0.5">
          Lamine Seck
        </div>
        <div className="text-[11px] font-mono text-[#F5C518]">
          Matricule AGT-TB-408
        </div>
        <div className="text-[10px] text-[#9EC0D4]/80 mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2E9E4F] inline-block shrink-0" />
          <span>Permanence active (Touba)</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 
        VERSION ORDINATEUR : 
        Fixe, visible en permanence (jamais pliée / jamais masquée sur ordinateur ou tablette)
      */}
      <aside
        id="main-sidebar"
        className={`hidden md:flex w-64 shrink-0 flex-col border-r transition-colors z-20 ${
          isDarkMode
            ? 'bg-[#0B2C40] border-[#174A66] text-white'
            : 'bg-[#0E3A50] border-[#083048] text-white'
        }`}
        aria-label="Navigation principale"
      >
        {renderNavContent(false)}
      </aside>

      {/* VERSION MOBILE : Tiroir superposé pour petits écrans uniquement (md:hidden) */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Fond assombri */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Tiroir coulissant */}
          <aside
            id="mobile-sidebar-drawer"
            className={`relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-50 ${
              isDarkMode ? 'bg-[#0B2C40] text-white' : 'bg-[#0E3A50] text-white'
            }`}
            aria-label="Menu mobile"
          >
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
