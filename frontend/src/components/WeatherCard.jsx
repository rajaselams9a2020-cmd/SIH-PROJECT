import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Thermometer, Droplets, Mountain, Wind, CloudRain, CalendarDays, TrendingUp } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  const { t } = useLanguage();

  if (!weather) return null;

  const {
    temperature = 31.2,
    humidity = 72,
    soil_moisture = 54,
    wind_speed = 14,
    today_rainfall = 12.4,
    rainfall_last_7days = 48.2,
    rainfall_last_14days = 94.0,
    rainfall_last_30days = 162.5,
    rainfall_anomaly = 18.2,
    consecutive_dry_days = 0,
    consecutive_wet_days = 2,
    status = "Partly Cloudy with Scattered Showers"
  } = weather;

  return (
    <div className="card weather-card">
      <div className="card-header-row">
        <div>
          <span className="card-eyebrow">GROUND TELEMETRY</span>
          <h3 className="card-main-title">{t('current_weather')}</h3>
        </div>
        <span className="weather-status-chip">
          {status}
        </span>
      </div>

      <div className="weather-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon-wrap icon-temp">
            <Thermometer size={20} />
          </div>
          <div>
            <span className="metric-label">{t('temperature')}</span>
            <div className="metric-val">{temperature}°C</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-hum">
            <Droplets size={20} />
          </div>
          <div>
            <span className="metric-label">{t('humidity')}</span>
            <div className="metric-val">{humidity}%</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-soil">
            <Mountain size={20} />
          </div>
          <div>
            <span className="metric-label">{t('soil_moisture')}</span>
            <div className="metric-val">{soil_moisture}%</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap icon-wind">
            <Wind size={20} />
          </div>
          <div>
            <span className="metric-label">{t('wind_speed')}</span>
            <div className="metric-val">{wind_speed} km/h</div>
          </div>
        </div>
      </div>

      <div className="rainfall-cumulative-strip">
        <div className="strip-item">
          <span className="strip-label">{t('rainfall_today')}</span>
          <span className="strip-value">{today_rainfall} mm</span>
        </div>
        <div className="strip-divider"></div>
        <div className="strip-item">
          <span className="strip-label">{t('rainfall_7d')}</span>
          <span className="strip-value">{rainfall_last_7days} mm</span>
        </div>
        <div className="strip-divider"></div>
        <div className="strip-item">
          <span className="strip-label">{t('rainfall_14d')}</span>
          <span className="strip-value">{rainfall_last_14days} mm</span>
        </div>
        <div className="strip-divider"></div>
        <div className="strip-item">
          <span className="strip-label">{t('rainfall_30d')}</span>
          <span className="strip-value">{rainfall_last_30days} mm</span>
        </div>
      </div>

      <div className="weather-anomaly-footer">
        <div className="anomaly-badge">
          <TrendingUp size={16} />
          <span>{t('rainfall_anomaly')}: <strong>{rainfall_anomaly > 0 ? `+${rainfall_anomaly}` : rainfall_anomaly} mm</strong></span>
        </div>
        <div className="streak-badge">
          <CalendarDays size={16} />
          <span>
            {consecutive_wet_days > 0 ? `${consecutive_wet_days} wet days in a row` : `${consecutive_dry_days} dry days in a row`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
