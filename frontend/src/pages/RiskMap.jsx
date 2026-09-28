import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import MapView from '../components/MapView';
import RiskBadge from '../components/RiskBadge';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { MapPin, Filter, CloudRain, Sun, CloudLightning, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RiskMap = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [points, setPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRiskMap = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRiskMap();
      setPoints(data);
      setFilteredPoints(data);
      if (data.length > 0) {
        setSelectedPoint(data[0]);
      }
    } catch (err) {
      console.error("Failed to load risk map points", err);
      setError("Failed to retrieve geospatial risk records. Please verify backend status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskMap();
  }, []);

  // Filter points when district or risk filter changes
  useEffect(() => {
    let result = points;
    if (selectedDistrict !== 'All') {
      result = result.filter(p => p.district.toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (selectedRisk !== 'All') {
      result = result.filter(p => p.risk_level.toUpperCase() === selectedRisk.toUpperCase());
    }
    setFilteredPoints(result);
  }, [selectedDistrict, selectedRisk, points]);

  const districtsList = ['All', ...new Set(points.map(p => p.district))];

  return (
    <div className="risk-map-page">
      <div className="page-header">
        <h1 className="page-title">{t('nav_risk_map')}</h1>
        <p className="page-subtitle">
          Geospatial vulnerability classification across Tamil Nadu blocks based on multi-hazard break spell, heavy downpour, and onset probabilities.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card map-filter-toolbar">
        <div className="filter-item">
          <Filter size={18} className="filter-icon" />
          <span className="filter-label">Filter District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="filter-select"
          >
            {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <span className="filter-label">Filter Risk Level:</span>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Risk Levels</option>
            <option value="LOW">🟢 Low Risk</option>
            <option value="MODERATE">🟡 Moderate Risk</option>
            <option value="HIGH">🟠 High Risk</option>
            <option value="CRITICAL">🔴 Critical Risk</option>
          </select>
        </div>

        <div className="filter-summary-stat">
          <span>Showing <strong>{filteredPoints.length}</strong> of {points.length} blocks</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Rendering interactive OpenStreetMap geospatial layers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRiskMap} />
      ) : (
        <div className="map-page-layout-grid">
          {/* Map Container */}
          <div className="map-view-column">
            <MapView
              points={filteredPoints}
              selectedPoint={selectedPoint}
              onSelectPoint={(pt) => setSelectedPoint(pt)}
              height={540}
            />
          </div>

          {/* Selected Location Detail Inspector Card */}
          <div className="map-inspector-column">
            {selectedPoint ? (
              <div className="card inspector-card">
                <div className="inspector-header">
                  <div>
                    <span className="card-eyebrow">BLOCK RISK DOSSIER</span>
                    <h3 className="inspector-title">{selectedPoint.panchayat}, {selectedPoint.block}</h3>
                    <p className="inspector-sub">{selectedPoint.district} District, {selectedPoint.state}</p>
                  </div>
                  <RiskBadge level={selectedPoint.risk_level} size="lg" />
                </div>

                <div className="inspector-metrics-grid">
                  <div className="ins-metric-tile">
                    <CloudRain size={18} className="text-blue" />
                    <div>
                      <span className="ins-label">{t('onset_prob')}</span>
                      <strong className="ins-value text-blue">{selectedPoint.onset_probability}%</strong>
                    </div>
                  </div>

                  <div className="ins-metric-tile">
                    <Sun size={18} className="text-amber" />
                    <div>
                      <span className="ins-label">{t('dry_spell_prob')}</span>
                      <strong className="ins-value text-amber">{selectedPoint.dry_spell_probability}%</strong>
                    </div>
                  </div>

                  <div className="ins-metric-tile">
                    <CloudLightning size={18} className="text-red" />
                    <div>
                      <span className="ins-label">{t('heavy_rain_prob')}</span>
                      <strong className="ins-value text-red">{selectedPoint.heavy_rain_probability}%</strong>
                    </div>
                  </div>

                  <div className="ins-metric-tile">
                    <ShieldCheck size={18} className="text-emerald" />
                    <div>
                      <span className="ins-label">{t('confidence_score')}</span>
                      <strong className="ins-value text-emerald">{selectedPoint.confidence}%</strong>
                    </div>
                  </div>
                </div>

                <div className="ins-expected-rain-banner">
                  <span>Expected 14-Day Precipitation:</span>
                  <strong>{selectedPoint.expected_rainfall} mm</strong>
                </div>

                <div className="ins-action-block">
                  <span className="ins-action-heading">RECOMMENDED FIELD ACTION:</span>
                  <p className="ins-action-msg">
                    {language === 'ta' && selectedPoint.tamil_action ? selectedPoint.tamil_action : selectedPoint.recommended_action}
                  </p>
                </div>

                <div className="inspector-buttons-row">
                  <button 
                    onClick={() => navigate(`/advisory`)}
                    className="btn-primary"
                  >
                    <span>View Crop Advisory</span>
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => navigate(`/forecast`)}
                    className="btn-secondary"
                  >
                    <span>View 30-Day Curve</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="card empty-inspector">
                <MapPin size={36} className="text-muted" />
                <p>Click any block marker on the map to inspect its hyperlocal risk profile.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMap;
