import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const RiskBadge = ({ level = 'LOW', size = 'md' }) => {
  const { t } = useLanguage();
  const normalized = (level || 'LOW').toUpperCase();

  let colorClass = 'badge-low';
  let dotColor = '#16a34a';
  let labelKey = 'risk_low';

  if (normalized === 'CRITICAL') {
    colorClass = 'badge-critical';
    dotColor = '#dc2626';
    labelKey = 'risk_critical';
  } else if (normalized === 'HIGH') {
    colorClass = 'badge-high';
    dotColor = '#ea580c';
    labelKey = 'risk_high';
  } else if (normalized === 'MODERATE' || normalized === 'MEDIUM') {
    colorClass = 'badge-moderate';
    dotColor = '#d97706';
    labelKey = 'risk_mod';
  }

  return (
    <span className={`risk-badge ${colorClass} risk-badge-${size}`}>
      <span className="risk-dot" style={{ backgroundColor: dotColor }}></span>
      <span className="risk-text">{t(labelKey)}</span>
    </span>
  );
};

export default RiskBadge;
