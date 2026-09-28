import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import MapView from '../components/MapView';
import RiskBadge from '../components/RiskBadge';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { MapPin, Send, Sprout, CheckCircle2, CloudRain, Sun, CloudLightning, ShieldCheck } from 'lucide-react';

const OfficerMap = () => {
  const { t } = useLanguage();
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulated Alert & Advisory state
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [advisorySuccess, setAdvisorySuccess] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const data = await api.getRiskMap();
        setPoints(data);
        if (data.length > 0) setSelectedPoint(data[0]);
      } catch (err) {
        console.error(err);
        setError("Failed to load geospatial risk map.");
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const handleSendSimulatedAlert = async () => {
    if (!selectedPoint) return;
    setDispatching(true);
    try {
      const res = await api.sendAlert({
        district: selectedPoint.district,
        block: selectedPoint.block,
        title: `Priority Agro Alert for ${selectedPoint.block}`,
        message: selectedPoint.recommended_action,
        alert_type: selectedPoint.dry_spell_probability > 50 ? 'dry_spell' : 'heavy_rain'
      });
      setAlertSuccess(`Alert sent to ${res.alert?.target_farmers || selectedPoint.farmer_count} farmers in ${selectedPoint.block}!`);
      setTimeout(() => setAlertSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const handleGenerateAdvisory = async () => {
    if (!selectedPoint) return;
    try {
      const res = await api.generateAdvisory(selectedPoint.location_id, 1);
      setAdvisorySuccess(`Advisory #${res.id} published for ${selectedPoint.block}: "${res.message.slice(0, 75)}..."`);
      setTimeout(() => setAdvisorySuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="officer-map-page">
      <div className="page-header">
        <h1 className="page-title">Officer Interactive Surveillance Map</h1>
        <p className="page-subtitle">
          Geographic block-level triage. Select any block marker to dispatch simulated agricultural advisories and emergency notifications.
        </p>
      </div>

      {alertSuccess && (
        <div className="toast-success-banner">
          <CheckCircle2 size={18} />
          <span>{alertSuccess}</span>
        </div>
      )}

      {advisorySuccess && (
        <div className="toast-success-banner toast-blue">
          <Sprout size={18} />
          <span>{advisorySuccess}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading geographic coordinates and risk layers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="map-page-layout-grid">
          <div className="map-view-column">
            <MapView
              points={points}
              selectedPoint={selectedPoint}
              onSelectPoint={(pt) => setSelectedPoint(pt)}
              height={560}
            />
          </div>

          <div className="map-inspector-column">
            {selectedPoint ? (
              <div className="card officer-inspector-card">
                <div className="inspector-header">
                  <div>
                    <span className="card-eyebrow">OFFICER BLOCK PROFILE</span>
                    <h3 className="inspector-title">{selectedPoint.block} Block</h3>
                    <p className="inspector-sub">{selectedPoint.panchayat}, {selectedPoint.district} District</p>
                  </div>
                  <RiskBadge level={selectedPoint.risk_level} size="lg" />
                </div>

                <div className="officer-stats-strip">
                  <div className="officer-stat-pill">
                    <span>Registered Farmers:</span>
                    <strong>👥 {selectedPoint.farmer_count}</strong>
                  </div>
                  <div className="officer-stat-pill">
                    <span>Principal Crops:</span>
                    <strong>🌾 Paddy, Millets, Groundnut</strong>
                  </div>
                </div>

                <div className="inspector-metrics-grid">
                  <div className="ins-metric-tile">
                    <CloudRain size={18} className="text-blue" />
                    <div>
                      <span className="ins-label">Onset Probability</span>
                      <strong className="ins-value text-blue">{selectedPoint.onset_probability}%</strong>
                    </div>
                  </div>

                  <div className="ins-metric-tile">
                    <Sun size={18} className="text-amber" />
                    <div>
                      <span className="ins-label">Dry Spell Probability</span>
                      <strong className="ins-value text-amber">{selectedPoint.dry_spell_probability}%</strong>
                    </div>
                  </div>

                  <div className="ins-metric-tile">
                    <CloudLightning size={18} className="text-red" />
                    <div>
                      <span className="ins-label">Heavy Rain Risk</span>
                      <strong className="ins-value text-red">{selectedPoint.heavy_rain_probability}%</strong>
                    </div>
                  </div>

                  <div className="ins-metric-tile">
                    <ShieldCheck size={18} className="text-emerald" />
                    <div>
                      <span className="ins-label">Confidence Score</span>
                      <strong className="ins-value text-emerald">{selectedPoint.confidence}%</strong>
                    </div>
                  </div>
                </div>

                <div className="ins-action-block">
                  <span className="ins-action-heading">CURRENT SYSTEM RECOMMENDATION:</span>
                  <p className="ins-action-msg">{selectedPoint.recommended_action}</p>
                </div>

                {/* Section 24 required action buttons */}
                <div className="officer-action-buttons-stack">
                  <button
                    onClick={handleGenerateAdvisory}
                    className="btn-primary"
                  >
                    <Sprout size={18} />
                    <span>Generate Advisory</span>
                  </button>

                  <button
                    onClick={handleSendSimulatedAlert}
                    disabled={dispatching}
                    className="btn-secondary btn-alert-dispatch"
                  >
                    <Send size={18} />
                    <span>{dispatching ? "Sending..." : "Send Alert"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="card empty-inspector">
                <p>Click a marker on the map to evaluate block status.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerMap;
