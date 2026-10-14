import React from 'react';
import { LayoutDashboard, Map, Send, History } from 'lucide-react';
import { ScreenId } from '../types.ts';

interface MobileBottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isDarkMode: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  onNavigate,
  isDarkMode
}) => {
  const items: { id: ScreenId; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Tableau',
      icon: LayoutDashboard
    },
    {
      id: 'map',
      label: 'Carte 48h',
      icon: Map
    },
    {
      id: 'trigger',
      label: 'Alerte',
      icon: Send,
      badge: 'Action'
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: History
    }
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t transition-colors shadow-2xl ${
        isDarkMode
          ? 'bg-[#0B2C40] border-[#174A66]'
          : 'bg-[#0E3A50] border-[#083048]'
      }`}
      aria-label="Navigation mobile principale"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-1">
        {items.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 relative min-h-[48px] py-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-[#F5C518] font-bold'
                  : 'text-[#9EC0D4] hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Ligne active en haut */}
              {isActive && (
                <span className="absolute top-0 left-3 right-3 h-1 bg-[#F5C518] rounded-b-sm" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#F5C518]' : 'text-[#9EC0D4]'}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#A82222]" />
                )}
              </div>

              <span className="text-[11px] tracking-tight leading-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
