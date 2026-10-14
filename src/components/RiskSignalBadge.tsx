import React from 'react';
import { RISK_LEVELS } from '../mockData.js';

interface RiskSignalBadgeProps {
  level: 'très faible' | 'faible' | 'modéré' | 'élevé' | 'très élevé' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
}

export const RiskSignalBadge: React.FC<RiskSignalBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'md',
  isDarkMode = false
}) => {
  // Mapper le libellé strict vers la définition
  let def = RISK_LEVELS.VERY_LOW;
  const normalized = (level || '').toLowerCase().trim();

  if (normalized === 'très élevé' || normalized === 'tres eleve') {
    def = RISK_LEVELS.VERY_HIGH;
  } else if (normalized === 'élevé' || normalized === 'eleve') {
    def = RISK_LEVELS.HIGH;
  } else if (normalized === 'modéré' || normalized === 'modere') {
    def = RISK_LEVELS.MODERATE;
  } else if (normalized === 'faible') {
    def = RISK_LEVELS.LOW;
  } else {
    def = RISK_LEVELS.VERY_LOW;
  }

  // Tailles
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2.5 font-bold'
  }[size];

  const shapeSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  // Rendu géométrique précis pour daltonisme (Signal 3 : Forme géométrique et crans)
  const renderShape = () => {
    switch (def.id) {
      case 'tres-eleve': // Octogone / stop
        return (
          <span
            className={`inline-flex items-center justify-center font-black ${shapeSize} rounded-xs text-white shrink-0`}
            style={{ backgroundColor: def.colorHex }}
            title="Niveau 5/5 : Octogone critique"
          >
            !
          </span>
        );
      case 'eleve': // Carré plein
        return (
          <span
            className={`inline-block ${shapeSize} rounded-xs shrink-0`}
            style={{ backgroundColor: def.colorHex }}
            title="Niveau 4/5 : Carré plein"
          />
        );
      case 'modere': // Triangle
        return (
          <span
            className={`inline-flex items-center justify-center font-bold ${shapeSize} shrink-0 text-amber-900 leading-none`}
            title="Niveau 3/5 : Triangle d'attention"
          >
            ▲
          </span>
        );
      case 'faible': // Losange
        return (
          <span
            className={`inline-block ${shapeSize} rotate-45 rounded-2xs shrink-0`}
            style={{ backgroundColor: def.colorHex }}
            title="Niveau 2/5 : Losange"
          />
        );
      default: // Cercle
        return (
          <span
            className={`inline-block ${shapeSize} rounded-full border-2 shrink-0`}
            style={{ borderColor: def.colorHex, backgroundColor: isDarkMode ? '#133841' : '#E8F5F7' }}
            title="Niveau 1/5 : Cercle ouvert"
          />
        );
    }
  };

  const backgroundColor = isDarkMode ? def.bgDark : def.bgLight;
  const borderColor = isDarkMode ? def.borderDark : def.borderLight;
  const textColor = isDarkMode ? '#F0F9FF' : def.colorHex;

  return (
    <div
      className={`inline-flex items-center font-medium rounded-md border tracking-tight shrink-0 select-none ${sizeClasses}`}
      style={{
        backgroundColor,
        borderColor,
        color: textColor
      }}
      role="status"
      aria-label={`Risque ${def.label}${score !== undefined ? `, ${score} %` : ''}`}
    >
      {/* Signal 3A : Forme géométrique non ambigüe */}
      {renderShape()}

      {/* Signal 2 : Libellé écrit strict */}
      <span className="capitalize font-semibold text-[14px]">
        {def.label}
      </span>

      {/* Signal 3B : Valeur chiffrée ou cran de sévérité */}
      {showScore && (
        <span
          className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 ml-0.5"
          style={{ color: isDarkMode ? '#FFFFFF' : '#10344A' }}
        >
          {score !== undefined ? `${Math.round(score)} %` : `Niv. ${def.severityTier}/5`}
        </span>
      )}
    </div>
  );
};
