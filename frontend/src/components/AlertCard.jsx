import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, CloudRain, Sun, CloudLightning, Sprout, Droplets, X } from 'lucide-react';

const alertIcons = {
  monsoon_onset: CloudRain,
  dry_spell: Sun,
  heavy_rain: CloudLightning,
  sowing: Sprout,
  irrigation: Droplets
};

const alertColors = {
  monsoon_onset: 'alert-blue',
  dry_spell: 'alert-amber',
  heavy_rain: 'alert-red',
  sowing: 'alert-emerald',
  irrigation: 'alert-cyan'
};

const AlertCard = ({ alert, onDismiss }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!alert) return null;

  const Icon = alertIcons[alert.alert_type] || AlertTriangle;
  const colorClass = alertColors[alert.alert_type] || 'alert-amber';

  return (
    <div className={`card alert-item-card ${colorClass}`}>
      <div className="alert-card-inner">
        <div className="alert-icon-box">
          <Icon size={22} />
        </div>

        <div className="alert-content-box">
          <div className="alert-top-row">
            <span className="alert-type-tag">{alert.alert_type ? alert.alert_type.toUpperCase().replace('_', ' ') : 'ALERT'}</span>
            {alert.created_at && (
              <span className="alert-timestamp">
                {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <h4 className="alert-headline">{alert.title}</h4>
          <p className="alert-body-msg">{alert.message}</p>

          <div className="alert-buttons-row">
            <button
              onClick={() => navigate('/advisory')}
              className="btn-alert-action"
            >
              {t('view_advisory')}
            </button>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="btn-alert-dismiss"
              >
                {t('dismiss')}
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button 
            onClick={() => onDismiss(alert.id)}
            className="alert-close-btn"
            title={t('dismiss')}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
