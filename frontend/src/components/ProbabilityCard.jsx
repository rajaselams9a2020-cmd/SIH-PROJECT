import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import RiskBadge from './RiskBadge';
import { CloudRain, SunMedium, CloudLightning, ShieldCheck, Info } from 'lucide-react';

const CircularProgress = ({ percentage, color, label, icon: Icon, unit = "%" }) => {
  const radius = 38;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="prob-meter-item">
      <div className="meter-svg-wrap">
        <svg height={radius * 2} width={radius * 2} className="meter-svg">
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="meter-val-overlay">
          <span className="meter-number">{Math.round(percentage)}{unit}</span>
        </div>
      </div>
      <div className="meter-label-row">
        {Icon && <Icon size={16} style={{ color }} />}
        <span className="meter-label">{label}</span>
      </div>
    </div>
  );
};

const ProbabilityCard = ({ prediction }) => {
  const { t } = useLanguage();

  if (!prediction) return null;

  const {
    onset_probability = 72,
    dry_spell_probability = 18,
    heavy_rain_probability = 28,
    confidence = 82,
    expected_rainfall = 76.4,
    risk_level = "LOW",
    last_updated = "Just now",
    model_name = "Hybrid Prototype Model"
  } = prediction;

  return (
    <div className="card probability-card">
      <div className="card-header-row">
        <div>
          <span className="card-eyebrow">{t('monsoon_outlook')}</span>
          <h2 className="card-main-title">{t('horizon_14')}</h2>
        </div>
        <div className="card-header-badge">
          <RiskBadge level={risk_level} size="lg" />
        </div>
      </div>

      <div className="prob-meters-grid">
        <CircularProgress
          percentage={onset_probability}
          color="#0284c7"
          label={t('onset_prob')}
          icon={CloudRain}
        />
        <CircularProgress
          percentage={dry_spell_probability}
          color="#f59e0b"
          label={t('dry_spell_prob')}
          icon={SunMedium}
        />
        <CircularProgress
          percentage={heavy_rain_probability}
          color="#ef4444"
          label={t('heavy_rain_prob')}
          icon={CloudLightning}
        />
        <CircularProgress
          percentage={confidence}
          color="#16a34a"
          label={t('confidence_score')}
          icon={ShieldCheck}
        />
      </div>

      <div className="rainfall-stat-banner">
        <div className="stat-banner-left">
          <span className="stat-banner-label">{t('expected_rain')}</span>
          <span className="stat-banner-value">{expected_rainfall} mm</span>
        </div>
        <div className="stat-banner-right">
          <span className="model-pill">🤖 {model_name}</span>
        </div>
      </div>

      <div className="model-transparency-footer">
        <Info size={14} className="info-icon" />
        <p className="disclaimer-text">
          {t('model_disclaimer')} • <span className="timestamp">{t('last_updated')}: {last_updated}</span>
        </p>
      </div>
    </div>
  );
};

export default ProbabilityCard;
