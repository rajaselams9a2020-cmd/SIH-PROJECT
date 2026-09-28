import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LocationSelector from '../components/LocationSelector';
import ForecastChart from '../components/ForecastChart';
import RainfallChart from '../components/RainfallChart';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { Calendar, CloudRain, ShieldCheck, SunMedium } from 'lucide-react';

const Forecast = () => {
  const { t } = useLanguage();
  const [locationId, setLocationId] = useState(1);
  const [forecastDays, setForecastDays] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecast = async (locId) => {
    setLoading(true);
    setError(null);
    try {
      const [daysData, summaryData] = await Promise.all([
        api.get30DayPrediction(locId),
        api.getPredictionSummary(locId)
      ]);
      setForecastDays(daysData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load forecast data", err);
      setError("Failed to retrieve 30-day forecast. Verify backend is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(locationId);
  }, [locationId]);

  return (
    <div className="forecast-page">
      <div className="page-header">
        <h1 className="page-title">7–30 Day Hyperlocal Precipitation Forecast</h1>
        <p className="page-subtitle">
          Probabilistic rainfall envelopes, historical baseline comparison, and dry-spell risk dynamics.
        </p>
      </div>

      <LocationSelector
        selectedLocationId={locationId}
        onLocationChange={(loc) => setLocationId(loc.id)}
      />

      {loading ? (
        <LoadingSpinner text="Computing 30-day precipitation trajectory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchForecast(locationId)} />
      ) : (
        <div className="forecast-charts-stack">
          {/* Main 7-30 Day Composed Bar & Line Chart */}
          <ForecastChart data={forecastDays} />

          {/* Probability Trajectory Evolution */}
          <RainfallChart data={forecastDays} />

          {/* Detailed Day-by-Day Forecast Table */}
          <div className="card forecast-table-card">
            <div className="card-header-row">
              <div>
                <span className="card-eyebrow">SYNOPTIC LOG</span>
                <h3 className="card-main-title">30-Day Meteorological Projection Table</h3>
              </div>
              <span className="location-tag">📍 {summary?.location_name}</span>
            </div>

            <div className="table-responsive-wrapper">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Expected Rain (mm)</th>
                    <th>Normal Avg (mm)</th>
                    <th>Onset Prob</th>
                    <th>Dry Spell Prob</th>
                    <th>Heavy Rain Prob</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastDays.map((row) => (
                    <tr key={`day-${row.day}`}>
                      <td><strong>Day {row.day}</strong></td>
                      <td>{row.date}</td>
                      <td>
                        <span className={`rain-val-pill ${row.rainfall > 20 ? 'pill-heavy-rain' : ''}`}>
                          {row.rainfall} mm
                        </span>
                      </td>
                      <td>{row.historical_avg} mm</td>
                      <td>
                        <span className="prob-text text-blue">{row.onset_probability}%</span>
                      </td>
                      <td>
                        <span className="prob-text text-amber">{row.dry_spell_probability}%</span>
                      </td>
                      <td>
                        <span className="prob-text text-red">{row.heavy_rain_probability}%</span>
                      </td>
                      <td>
                        <span className="prob-text text-emerald">{row.confidence}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;
