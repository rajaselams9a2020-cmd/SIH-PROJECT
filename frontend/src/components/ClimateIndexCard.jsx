import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Compass, Waves, Wind, Activity, HelpCircle } from 'lucide-react';

const ClimateIndexCard = ({ climateData }) => {
  const { t } = useLanguage();

  if (!climateData) return null;

  const {
    enso = "Neutral (ONI: +0.2)",
    enso_index = 0.2,
    enso_impact = "Favorable for normal Northeast monsoon development across Tamil Nadu.",
    iod = "Positive (DMI: +0.28)",
    iod_index = 0.28,
    iod_impact = "Positive Indian Ocean Dipole fosters convective low pressures over the Bay of Bengal.",
    mjo_phase = 4,
    mjo_impact = "MJO in Phase 4 facilitates active convective propagation over the Indian Ocean.",
    climate_signal_score = 26.5,
    description = "Favorable ocean-atmosphere coupling indicated."
  } = climateData;

  return (
    <div className="card climate-index-card">
      <div className="card-header-row">
        <div>
          <span className="card-eyebrow">OCEANIC & ATMOSPHERIC TELECONNECTIONS</span>
          <h3 className="card-main-title">Macro Climate Indices</h3>
        </div>
        <div className="climate-score-pill">
          <Activity size={16} />
          <span>Teleconnection Signal: <strong>{climate_signal_score > 0 ? `+${climate_signal_score}` : climate_signal_score}</strong></span>
        </div>
      </div>

      <p className="climate-lead-desc">{description}</p>

      <div className="climate-triplet-grid">
        {/* ENSO Box */}
        <div className="climate-box enso-box">
          <div className="climate-box-header">
            <Waves size={20} className="climate-box-icon" />
            <div>
              <h4 className="climate-box-title">ENSO (El Niño Southern Oscillation)</h4>
              <span className="climate-val-badge">{enso}</span>
            </div>
          </div>
          <div className="climate-range-meter">
            <div className="meter-scale">
              <span className="scale-mark">La Niña</span>
              <span className="scale-mark active-mark">Neutral</span>
              <span className="scale-mark">El Niño</span>
            </div>
            <div className="scale-bar-track">
              <div 
                className="scale-bar-pointer" 
                style={{ left: `${Math.min(95, Math.max(5, ((enso_index + 2.0) / 4.0) * 100))}%` }}
              ></div>
            </div>
          </div>
          <p className="climate-impact-text">{enso_impact}</p>
        </div>

        {/* IOD Box */}
        <div className="climate-box iod-box">
          <div className="climate-box-header">
            <Wind size={20} className="climate-box-icon" />
            <div>
              <h4 className="climate-box-title">IOD (Indian Ocean Dipole)</h4>
              <span className="climate-val-badge">{iod}</span>
            </div>
          </div>
          <div className="climate-range-meter">
            <div className="meter-scale">
              <span className="scale-mark">Negative</span>
              <span className="scale-mark">Neutral</span>
              <span className="scale-mark active-mark">Positive</span>
            </div>
            <div className="scale-bar-track">
              <div 
                className="scale-bar-pointer" 
                style={{ left: `${Math.min(95, Math.max(5, ((iod_index + 1.0) / 2.0) * 100))}%` }}
              ></div>
            </div>
          </div>
          <p className="climate-impact-text">{iod_impact}</p>
        </div>

        {/* MJO Box */}
        <div className="climate-box mjo-box">
          <div className="climate-box-header">
            <Compass size={20} className="climate-box-icon" />
            <div>
              <h4 className="climate-box-title">MJO (Madden-Julian Oscillation)</h4>
              <span className="climate-val-badge">Phase {mjo_phase} of 8</span>
            </div>
          </div>
          <div className="mjo-phases-strip">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
              <span 
                key={`mjo-${p}`} 
                className={`mjo-phase-node ${p === mjo_phase ? 'current-phase' : ''} ${[3, 4, 5].includes(p) ? 'favorable-phase' : ''}`}
                title={`Phase ${p}: ${[3, 4, 5].includes(p) ? 'Indian Ocean (Convective)' : 'Suppressive/Distant'}`}
              >
                P{p}
              </span>
            ))}
          </div>
          <p className="climate-impact-text">{mjo_impact}</p>
        </div>
      </div>
    </div>
  );
};

export default ClimateIndexCard;
