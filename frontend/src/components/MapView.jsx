import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';
import RiskBadge from './RiskBadge';
import { CloudRain, Sun, CloudLightning, ShieldCheck, MapPin } from 'lucide-react';

// Center updater helper
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({ points = [], selectedPoint = null, onSelectPoint = null, height = 480 }) => {
  const { t, language } = useLanguage();
  const defaultCenter = [11.5, 79.0]; // Tamil Nadu geographic center
  const center = selectedPoint ? [selectedPoint.latitude, selectedPoint.longitude] : defaultCenter;
  const zoom = selectedPoint ? 10 : 7;

  const getColor = (risk) => {
    const r = (risk || 'LOW').toUpperCase();
    if (r === 'CRITICAL') return '#dc2626';
    if (r === 'HIGH') return '#ea580c';
    if (r === 'MODERATE' || r === 'MEDIUM') return '#d97706';
    return '#16a34a';
  };

  return (
    <div className="card map-card-container">
      <div className="map-legend-bar">
        <div className="legend-title-wrap">
          <MapPin size={18} className="text-emerald" />
          <span className="legend-title">Hyperlocal Block/Panchayat Risk Map</span>
        </div>
        <div className="legend-items">
          <span className="legend-pill">
            <span className="legend-dot" style={{ backgroundColor: '#16a34a' }}></span>
            <span>🟢 LOW</span>
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ backgroundColor: '#d97706' }}></span>
            <span>🟡 MODERATE</span>
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ backgroundColor: '#ea580c' }}></span>
            <span>🟠 HIGH</span>
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ backgroundColor: '#dc2626' }}></span>
            <span>🔴 CRITICAL</span>
          </span>
        </div>
      </div>

      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }} className="leaflet-map-wrapper">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <ChangeMapView center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {points.map((pt) => {
            const circleColor = getColor(pt.risk_level);
            return (
              <CircleMarker
                key={`map-pt-${pt.location_id}`}
                center={[pt.latitude, pt.longitude]}
                radius={11}
                pathOptions={{
                  fillColor: circleColor,
                  fillOpacity: 0.85,
                  color: '#ffffff',
                  weight: 2.5
                }}
                eventHandlers={{
                  click: () => {
                    if (onSelectPoint) onSelectPoint(pt);
                  }
                }}
              >
                <Popup>
                  <div className="map-popup-card">
                    <div className="popup-header">
                      <h4 className="popup-block-name">{pt.panchayat}, {pt.block}</h4>
                      <p className="popup-district">{pt.district}, {pt.state}</p>
                    </div>

                    <div className="popup-badge-row">
                      <RiskBadge level={pt.risk_level} size="sm" />
                      <span className="popup-farmers-count">👥 {pt.farmer_count} farmers</span>
                    </div>

                    <div className="popup-metrics-table">
                      <div className="popup-metric">
                        <span className="m-label">Onset Probability:</span>
                        <strong className="m-val text-blue">{pt.onset_probability}%</strong>
                      </div>
                      <div className="popup-metric">
                        <span className="m-label">Dry Spell Risk:</span>
                        <strong className="m-val text-amber">{pt.dry_spell_probability}%</strong>
                      </div>
                      <div className="popup-metric">
                        <span className="m-label">Heavy Rain Risk:</span>
                        <strong className="m-val text-red">{pt.heavy_rain_probability}%</strong>
                      </div>
                      <div className="popup-metric">
                        <span className="m-label">Expected Rain (14D):</span>
                        <strong className="m-val">{pt.expected_rainfall} mm</strong>
                      </div>
                      <div className="popup-metric">
                        <span className="m-label">Confidence:</span>
                        <strong className="m-val text-emerald">{pt.confidence}%</strong>
                      </div>
                    </div>

                    <div className="popup-action-box">
                      <span className="action-tag">ACTIONABLE GUIDANCE</span>
                      <p className="popup-action-text">
                        {language === 'ta' && pt.tamil_action ? pt.tamil_action : pt.recommended_action}
                      </p>
                    </div>

                    {onSelectPoint && (
                      <button 
                        onClick={() => onSelectPoint(pt)} 
                        className="btn-select-location"
                      >
                        Inspect Location Details
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
