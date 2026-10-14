import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { ScreenId } from '../types.ts';

interface PlaceholderViewProps {
  screenId: ScreenId;
  onBackToDashboard: () => void;
  isDarkMode: boolean;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  screenId,
  onBackToDashboard,
  isDarkMode
}) => {
  const titles: Record<string, { title: string; desc: string }> = {
    'field-reports': {
      title: 'Retours terrain communautaires',
      desc: 'Remontées géolocalisées des délégués de quartier et daaras via WhatsApp.'
    },
    'beneficiaries': {
      title: 'Registre des bénéficiaires WhatsApp',
      desc: 'Gestion des répertoires téléphoniques des chefs de concession et relais de quartier.'
    },
    'settings': {
      title: 'Paramètres & Modèles prédictifs',
      desc: 'Calibration des seuils de précipitation ECMWF et configurations des passerelles API.'
    }
  };

  const info = titles[screenId] || { title: 'Module complémentaire', desc: '' };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F3FC] dark:bg-[#0B2C40] border border-[#A3D4DC] dark:border-[#174A66] flex items-center justify-center text-[#1B5E8C] dark:text-[#F5C518]">
        <Clock className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#F5C518]/20 text-[#8F5A02] dark:text-[#F5C518] border border-[#F5C518]/40">
          Bientôt disponible
        </span>
        <h2 className="text-xl font-bold text-[#10344A] dark:text-white mt-2">
          {info.title}
        </h2>
        <p className="text-sm text-[#3A6076] dark:text-[#9EC0D4] max-w-md mx-auto">
          {info.desc}
        </p>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E3A50] hover:bg-[#083048] text-white text-sm font-bold shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Revenir au tableau de bord</span>
        </button>
      </div>
    </div>
  );
};
