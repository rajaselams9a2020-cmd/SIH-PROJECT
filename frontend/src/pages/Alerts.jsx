import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AlertCard from '../components/AlertCard';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { Bell, ShieldAlert, CheckCircle2, History } from 'lucide-react';

const Alerts = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertsData, historyData] = await Promise.all([
        api.getAlerts(),
        api.getAlertHistory()
      ]);
      setAlerts(alertsData);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to load alerts", err);
      setError("Unable to retrieve alerts from the dispatch service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDismiss = async (alertId) => {
    try {
      await api.dismissAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.error("Failed to dismiss alert", err);
    }
  };

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h1 className="page-title">{t('alerts_title')}</h1>
        <p className="page-subtitle">
          Real-time agro-meteorological bulletins, extreme precipitation warnings, and monsoon break notifications.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Scanning active alert channels and bulletin logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAlerts} />
      ) : (
        <div className="alerts-page-grid">
          {/* Active Alerts Feed */}
          <div className="alerts-active-column">
            <div className="card active-alerts-header-card">
              <div className="card-header-row">
                <div className="header-icon-title">
                  <Bell size={22} className="text-amber" />
                  <h3 className="card-main-title">Active Field Bulletins ({alerts.length})</h3>
                </div>
                <span className="live-status-pill">● System Live</span>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="card empty-alerts-card">
                <CheckCircle2 size={36} className="text-emerald" />
                <h4>No Critical Weather Alerts</h4>
                <p>{t('no_alerts')}</p>
              </div>
            ) : (
              <div className="alerts-list-stack">
                {alerts.map(alt => (
                  <AlertCard
                    key={`alert-item-${alt.id}`}
                    alert={alt}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Historical Dispatch Feed */}
          <div className="alerts-history-column">
            <div className="card history-card">
              <div className="card-header-row">
                <div className="header-icon-title">
                  <History size={20} className="text-blue" />
                  <h3 className="card-main-title">{t('alert_history')}</h3>
                </div>
              </div>

              <div className="history-timeline">
                {history.map((h) => (
                  <div key={`hist-${h.id}`} className="history-entry">
                    <div className="entry-point"></div>
                    <div className="entry-body">
                      <div className="entry-meta">
                        <span className="entry-date">{h.date}</span>
                        <span className="entry-farmers-reach">📢 {h.target_farmers}</span>
                      </div>
                      <h4 className="entry-title">{h.title}</h4>
                      <p className="entry-msg">{h.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
