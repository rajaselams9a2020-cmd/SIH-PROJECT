import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ClimateIndexCard from '../components/ClimateIndexCard';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { Compass, Info, Waves, Wind } from 'lucide-react';

const ClimateIndices = () => {
  const { t } = useLanguage();
  const [climate, setClimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClimate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getClimateIndices();
      setClimate(data);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve climate teleconnections data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClimate();
  }, []);

  return (
    <div className="climate-indices-page">
      <div className="page-header">
        <h1 className="page-title">{t('nav_climate')}</h1>
        <p className="page-subtitle">
          Monitoring planetary-scale teleconnections that govern Northeast and Southwest monsoon behavior over Peninsular India.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving equatorial Pacific and Indian Ocean indices..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchClimate} />
      ) : (
        <div className="climate-page-stack">
          <ClimateIndexCard climateData={climate} />

          <div className="card teleconnection-deepdive-card">
            <div className="card-header-row">
              <div className="header-icon-title">
                <Info size={20} className="text-blue" />
                <h3 className="card-main-title">Teleconnection Dynamics in Tamil Nadu Meteorology</h3>
              </div>
            </div>

            <div className="teleconnection-explain-grid">
              <div className="tele-item">
                <div className="tele-item-title">
                  <Waves size={18} className="text-blue" />
                  <h4>ENSO & Northeast Monsoon</h4>
                </div>
                <p>
                  While El Niño frequently suppresses the summer Southwest monsoon across North and Central India, 
                  it historically correlates with near-normal to above-normal precipitation during the coastal Tamil Nadu 
                  Northeast monsoon (October–December) through enhanced easterly wave generation.
                </p>
              </div>

              <div className="tele-item">
                <div className="tele-item-title">
                  <Wind size={18} className="text-emerald" />
                  <h4>Indian Ocean Dipole (IOD)</h4>
                </div>
                <p>
                  A positive Indian Ocean Dipole phase warms the western equatorial Indian Ocean and creates an active 
                  convergence zone, driving moisture plumes towards the Bay of Bengal and boosting rain spells in the Cauvery Delta.
                </p>
              </div>

              <div className="tele-item">
                <div className="tele-item-title">
                  <Compass size={18} className="text-indigo" />
                  <h4>Madden-Julian Oscillation (MJO)</h4>
                </div>
                <p>
                  MJO phases 3, 4, and 5 represent the eastward propagation of deep convective clouds directly through 
                  the Indian Ocean and Maritime Continent. When MJO enters these phases with amplitude &gt; 1, 
                  it sharply elevates heavy rainfall and cyclonic disturbance probabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateIndices;
