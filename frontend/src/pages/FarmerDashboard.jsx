import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import LocationSelector from '../components/LocationSelector';
import CropSelector from '../components/CropSelector';
import ProbabilityCard from '../components/ProbabilityCard';
import WeatherCard from '../components/WeatherCard';
import AdvisoryCard from '../components/AdvisoryCard';
import AlertCard from '../components/AlertCard';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { MapPin, ArrowRight, BellRing, Sparkles, CloudRain } from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedLocationId, setSelectedLocationId] = useState(1);
  const [selectedCropId, setSelectedCropId] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async (locId, cropId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFarmerDashboard(locId, cropId);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load farmer dashboard", err);
      setError("Unable to connect to the prediction backend. Please verify server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedLocationId, selectedCropId);
  }, [selectedLocationId, selectedCropId]);

  const handleLocationChange = (newLocation) => {
    setSelectedLocationId(newLocation.id);
  };

  const handleCropChange = (newCropId) => {
    setSelectedCropId(newCropId);
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await api.dismissAlert(alertId);
      if (dashboardData && dashboardData.alerts) {
        setDashboardData(prev => ({
          ...prev,
          alerts: prev.alerts.filter(a => a.id !== alertId)
        }));
      }
    } catch (err) {
      console.error("Failed to dismiss alert", err);
    }
  };

  return (
    <div className="farmer-dashboard-page">
      {/* Top Banner & Greeting */}
      <div className="farmer-greeting-banner">
        <div className="greeting-text-wrap">
          <span className="greeting-eyebrow">
            🌱 {user ? `${t('farmer_greeting')}, ${user.name.split(' ')[0]}` : t('farmer_greeting')}
          </span>
          <h1 className="farmer-page-title">Hyperlocal Monsoon Intelligence</h1>
          <div className="location-breadcrumbs">
            <MapPin size={16} className="text-emerald" />
            <span>
              {dashboardData?.location 
                ? `${dashboardData.location.state} → ${dashboardData.location.district} District → ${dashboardData.location.block} Block → ${dashboardData.location.panchayat}`
                : "Tamil Nadu → Chengalpattu → Tambaram → Kadaperi"}
            </span>
          </div>
        </div>

        <div className="banner-quick-actions">
          <Link to="/forecast" className="btn-banner-link">
            <span>Detailed Forecast</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/risk-map" className="btn-banner-link btn-banner-secondary">
            <span>Risk Map</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Cascading Location Selector */}
      <section className="dashboard-section">
        <LocationSelector
          selectedLocationId={selectedLocationId}
          onLocationChange={handleLocationChange}
        />
      </section>

      {/* Crop Selector */}
      <section className="dashboard-section">
        <CropSelector
          selectedCropId={selectedCropId}
          onCropChange={handleCropChange}
        />
      </section>

      {/* Alerts Feed */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <section className="dashboard-section alerts-feed-section">
          <div className="section-title-strip">
            <BellRing size={20} className="text-amber" />
            <h3 className="section-inline-title">{t('alerts_title')}</h3>
          </div>
          <div className="alerts-stack">
            {dashboardData.alerts.map(alt => (
              <AlertCard
                key={`alert-${alt.id}`}
                alert={alt}
                onDismiss={handleDismissAlert}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Content Areas */}
      {loading ? (
        <LoadingSpinner text="Computing hyperlocal probabilities and crop advisory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchDashboard(selectedLocationId, selectedCropId)} />
      ) : (
        <div className="dashboard-content-stack">
          {/* Main Card: Monsoon Outlook (Probabilities) */}
          <ProbabilityCard prediction={dashboardData.prediction} />

          {/* Today's Agricultural Advisory & Sowing Window */}
          <AdvisoryCard 
            advisory={dashboardData.advisory} 
            sowingWindow={dashboardData.sowing_window}
          />

          {/* Ground Telemetry Weather Card */}
          <WeatherCard weather={dashboardData.weather} />
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
