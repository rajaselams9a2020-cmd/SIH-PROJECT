import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LocationSelector from '../components/LocationSelector';
import CropSelector from '../components/CropSelector';
import AdvisoryCard from '../components/AdvisoryCard';
import RiskBadge from '../components/RiskBadge';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { Sprout, Droplets, Calendar, ShieldAlert, CheckCircle2, Languages, Sparkles } from 'lucide-react';

const Advisory = () => {
  const { t, language } = useLanguage();
  const [locationId, setLocationId] = useState(1);
  const [cropId, setCropId] = useState(1);
  const [advisory, setAdvisory] = useState(null);
  const [sowingWindow, setSowingWindow] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvisories = async (locId, cId) => {
    setLoading(true);
    setError(null);
    try {
      const [advData, sowData, weatherData] = await Promise.all([
        api.getAdvisory(locId, cId),
        api.getSowingWindow(locId, cId),
        api.getCurrentWeather(locId)
      ]);
      setAdvisory(advData);
      setSowingWindow(sowData);
      setWeather(weatherData);
    } catch (err) {
      console.error("Failed to load agricultural advisory", err);
      setError("Unable to generate advisory. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories(locationId, cropId);
  }, [locationId, cropId]);

  return (
    <div className="advisory-page">
      <div className="page-header">
        <h1 className="page-title">{t('today_advisory')}</h1>
        <p className="page-subtitle">
          Expert agricultural recommendations converted from hyperlocal precipitation, break spells, and soil moisture signals.
        </p>
      </div>

      <LocationSelector
        selectedLocationId={locationId}
        onLocationChange={(loc) => setLocationId(loc.id)}
      />

      <CropSelector
        selectedCropId={cropId}
        onCropChange={(cId) => setCropId(cId)}
      />

      {loading ? (
        <LoadingSpinner text="Consulting agronomic rule engine and calculating soil moisture balance..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAdvisories(locationId, cropId)} />
      ) : (
        <div className="advisory-layout-grid">
          {/* Main Advisory Card */}
          <div className="advisory-main-col">
            <AdvisoryCard advisory={advisory} sowingWindow={sowingWindow} />

            {/* Sowing Window Deep-Dive Card */}
            {sowingWindow && (
              <div className="card sowing-deepdive-card">
                <div className="card-header-row">
                  <div className="sowing-title-group">
                    <Calendar size={22} className="text-emerald" />
                    <div>
                      <span className="card-eyebrow">AGRONOMIC SOWING TIMELINE</span>
                      <h3 className="card-main-title">{sowingWindow.crop_name} Sowing Window</h3>
                    </div>
                  </div>
                  <RiskBadge level={sowingWindow.risk_level} />
                </div>

                <div className="sowing-callout-grid">
                  <div className="sowing-callout-box">
                    <span className="sc-label">Window Status:</span>
                    <span className="sc-val-highlight">{sowingWindow.current_status}</span>
                  </div>
                  <div className="sowing-callout-box">
                    <span className="sc-label">Recommended Window:</span>
                    <span className="sc-val-dates">{sowingWindow.recommended_start_date} – {sowingWindow.recommended_end_date}</span>
                  </div>
                  <div className="sowing-callout-box">
                    <span className="sc-label">Prediction Confidence:</span>
                    <span className="sc-val-conf text-emerald">{sowingWindow.confidence}%</span>
                  </div>
                </div>

                <div className="sowing-reason-box">
                  <h4 className="reason-title">Meteorological & Soil Logic:</h4>
                  <p className="reason-body">
                    {language === 'ta' && sowingWindow.tamil_reason ? sowingWindow.tamil_reason : sowingWindow.reason}
                  </p>
                </div>

                <div className="sowing-checklist-box">
                  <h4 className="checklist-title">Pre-Sowing Action Checklist:</h4>
                  <div className="checklist-items">
                    {(language === 'ta' && sowingWindow.tamil_checklist ? sowingWindow.tamil_checklist : sowingWindow.action_checklist).map((item, i) => (
                      <div key={`chk-${i}`} className="chk-row">
                        <span className="chk-icon">✓</span>
                        <span className="chk-text">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Guidance / Moisture & Irrigation Support */}
          <div className="advisory-side-col">
            <div className="card irrigation-guidance-card">
              <div className="card-header-row">
                <div className="side-card-title-group">
                  <Droplets size={20} className="text-blue" />
                  <h4 className="card-main-title">{t('irrigation_warning')}</h4>
                </div>
              </div>

              <div className="moisture-meter-box">
                <div className="meter-label-row">
                  <span>Current Soil Moisture (0-30cm)</span>
                  <strong>{weather?.soil_moisture || 52}%</strong>
                </div>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill fill-blue" 
                    style={{ width: `${Math.min(100, Math.max(10, weather?.soil_moisture || 52))}%` }}
                  ></div>
                </div>
                <span className="moisture-caption">
                  {weather?.soil_moisture > 65 
                    ? "Adequate moisture: suspend flood irrigation to prevent root hypoxia."
                    : weather?.soil_moisture < 35 
                    ? "Deficit moisture: apply protective irrigation or delay dry sowing."
                    : "Optimal seedbed moisture level for Tamil Nadu delta & coastal soils."}
                </span>
              </div>

              <div className="irrigation-tips-list">
                <div className="tip-item">
                  <span className="tip-dot">💧</span>
                  <p>Check bund height (minimum 15 cm) to capture forecasted showers.</p>
                </div>
                <div className="tip-item">
                  <span className="tip-dot">🚜</span>
                  <p>Incorporate farmyard manure (FYM) to improve water retention during break spells.</p>
                </div>
                <div className="tip-item">
                  <span className="tip-dot">🌿</span>
                  <p>Apply straw mulch in dryland tracts to reduce pan evaporation.</p>
                </div>
              </div>
            </div>

            <div className="card expert-contact-card">
              <span className="card-eyebrow">OFFICIAL AGRONOMY EXTENSION</span>
              <h4 className="side-title">Tamil Nadu Agricultural Advisory Center</h4>
              <p className="side-desc">
                For localized seed procurement or pest diagnostics during erratic monsoon breaks:
              </p>
              <div className="contact-chip">
                <span>📞 Kisan Call Centre: <strong>1800-180-1551</strong> (Toll Free)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advisory;
